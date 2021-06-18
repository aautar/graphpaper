import {AccessibleRoutingPointsFinder} from './AccessibleRoutingPointsFinder';
import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import {PointVisibilityMapRouteOptimizer} from './PointVisibilityMapRouteOptimizer';
import {LineSet} from './LineSet';
import {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';
import {Rectangle} from './Rectangle';
import {Vec2} from './Vec2';

const VisiblePoints = {
    isValid: false,
    points: []
};

const PointInfo = {
    point: null,
    visiblePoints: null
};

function PointVisibilityMap() {
    const self = this;

    const entityIdToPointVisibility = new Map();
    const entityIdToBoundaryLineSet = new Map();
    const entityIdToDescriptor = new Map();
    let currentNumRoutingPoints = 0;
    let currentNumOfBoundaryLines = 0;

    /**
     * @param {Line} _theLine
     * @returns {Boolean}
     */
    const doesLineIntersectAnyBoundaryLines = function(_theLine) {
        for (let [_eid, _boundaryLineSet] of entityIdToBoundaryLineSet) {
            const descriptor = entityIdToDescriptor.get(_eid);

            if(_theLine.getMinX() > descriptor.outerBoundingRect.maxX) {
                continue;
            }
            
            if(_theLine.getMaxX() < descriptor.outerBoundingRect.minX) {
                continue;
            }

            if(_theLine.getMinY() > descriptor.outerBoundingRect.maxY) {
                continue;
            }

            if(_theLine.getMaxY() < descriptor.outerBoundingRect.minY) {
                continue;
            }

            const boundaryLinesArr = _boundaryLineSet.toArray();
            for(let i=0; i<boundaryLinesArr.length; i++) {
                const intersectionType = boundaryLinesArr[i].computeIntersectionType(_theLine);
                if(intersectionType === LINE_INTERSECTION_TYPE.LINESEG) {
                    return true;
                }
            }
        }

        return false;
    };

    const computePointsVisibilityForPoint = function(_pointInfo) {
        _pointInfo.visiblePoints.points.length = 0;

        for (let [_eid, _pvMap] of entityIdToPointVisibility) {
            for (let [_routingPoint, _visiblePoints] of _pvMap) {

                const ijLine = new Line(_pointInfo.point, _routingPoint);
                // Note: length check is to avoid adding point being tested to visiblePoints array
                if(ijLine.getLength() > 0 && !doesLineIntersectAnyBoundaryLines(ijLine)) {
                    _pointInfo.visiblePoints.points.push(_routingPoint);
                }

            }
        }

        _pointInfo.visiblePoints.isValid = true;
    };

    /**
     * 
     * @param {Point} _ptA 
     * @param {Point} _ptB
     * @returns {Boolean} 
     */
    const arePointsVisibleToEachOther = function(_ptA, _ptB) {
        const ptAInfo = fetchPointInfoForPoint(_ptA);
        const visiblePts = getVisiblePointsRelativeTo(ptAInfo);

        for(let i=0; i<visiblePts.length; i++) {
            if(visiblePts[i].isEqual(_ptB)) {
                return true;
            }
        }

        return false;
    };

    /**
     * 
     * @param {Object} _pointInfo
     * @returns {Point[]}
     */
    const getVisiblePointsRelativeTo = function(_pointInfo) {
        if(!_pointInfo.visiblePoints.isValid) {
            computePointsVisibilityForPoint(_pointInfo);
        }
        
        return _pointInfo.visiblePoints.points;
    };

    /**
     * 
     * @param {Point} _needle 
     * @param {Point[]} _haystack 
     */
    const isPointInArray = function(_needle, _haystack) {
        for(let i=0; i<_haystack.length; i++) {
            if(_needle.isEqual(_haystack[i])) {
                return true;
            }
        }

        return false;
    };

    /**
     * 
     * @param {Number} _currentRouteLength 
     * @param {Point[]} _pointsInRoute 
     * @param {Object} _currentPointIndex 
     * @param {Point} _startPoint 
     * @param {Point} _endPoint 
     * @param {Vec2} _vecStartToEnd
     * @returns {Object|null}
     */
    const routeToEndpoint = function(_currentRouteLength, _pointsInRoute, _currentPointInfo, _startPoint, _endPoint, _vecStartToEnd) {
        const currentPoint = _currentPointInfo.point;
        const visiblePoints = getVisiblePointsRelativeTo(_currentPointInfo);
        let curMinCost = Number.MAX_SAFE_INTEGER;
        let visiblePointWithMinCost = null;

        const vecToTargetIdeal = (new Vec2(_endPoint.getX() - currentPoint.getX(), _endPoint.getY() - currentPoint.getY())).normalize();

        /*const dbgInterestAt = 1;
        if(_pointsInRoute.length === dbgInterestAt) {
            console.log('vecToTargetIdeal = ' + vecToTargetIdeal.toString());
            console.log('currentPoint = ' + currentPoint.toString());
        }*/

        for(let i=0; i<visiblePoints.length; i++) {
            const visiblePt = visiblePoints[i];

            // ignore point if it's already in the route
            if(isPointInArray(visiblePt, _pointsInRoute)) {
                continue;
            }

            // g(n) = length/cost of _startPoint to _vp + _currentRouteLength
            const currentToVisibleLength = (new Line(currentPoint, visiblePt)).getLength();
            let gn = currentToVisibleLength + _currentRouteLength;

            // h(n) = length/cost of _vp to _endPoint
            let hn = (new Line(visiblePt, _endPoint)).getLength();

            // t(n) = 
            // a. get the relationship between the 2 vectors (dot product)
            // b. scale to give influence (scale by currentToVisibleLength)
            //    .. using currentToVisibleLength as scaling factor is influence towards longer paths in good directions vs shorter paths in bad directions
            const vecVisibleToEndpt = (new Vec2(visiblePt.getX() - currentPoint.getX(), visiblePt.getY() - currentPoint.getY())).normalize();
            const tn = vecToTargetIdeal.dot(vecVisibleToEndpt) * currentToVisibleLength;

            if(_endPoint.getX() > currentPoint.getX() && visiblePt.getX() > _endPoint.getX()) {
                tn = 0;
            }

            if(_endPoint.getX() < currentPoint.getX() && visiblePt.getX() < _endPoint.getX()) {
                tn = 0;
            }

            if(_endPoint.getY() > currentPoint.getY() && visiblePt.getY() > _endPoint.getY()) {
                tn = 0;
            }

            if(_endPoint.getY() < currentPoint.getY() && visiblePt.getY() < _endPoint.getY()) {
                tn = 0;
            }

            // if we can go to the endpoint, let's do that
            /*if(visiblePt.isEqual(_endPoint)) {
                gn = 0;
                hn = 0;
            }*/

            /*if(_pointsInRoute.length === dbgInterestAt) {
                console.log('visiblePt = ' + visiblePt.toString());
                console.log('vecVisibleToEndpt = ' + vecVisibleToEndpt.toString());
                console.log(tn);
            }*/        

            // see if this is the new min
            if((gn + hn - tn) < curMinCost) {
                curMinCost = gn + hn - tn;
                visiblePointWithMinCost = visiblePt;
            }
        }

        /*if(_pointsInRoute.length === dbgInterestAt) {
            console.log('winner = ' + visiblePointWithMinCost.toString());
        }*/

        if(curMinCost === Number.MAX_SAFE_INTEGER) {
            return null;
        }

        return {
            "cost": curMinCost,
            "point": visiblePointWithMinCost
        };
    };

    /**
     * @param {Object} _ed
     * @returns {LineSet}
     */    
    const getBoundaryLinesFromEntityDescriptor = function(_ed) {
        const boundaryLines = new LineSet();

        const entityBoundingRect = new Rectangle(_ed.x, _ed.y, _ed.x + _ed.width, _ed.y + _ed.height);
        const lines = entityBoundingRect.getLines();
        lines.forEach((_l) => {
            boundaryLines.push(_l);
        });

        const anchors = _ed.connectorAnchors;
        anchors.forEach(function(_anchor) {
            const anchorBoundingRect = new Rectangle(_anchor.x, _anchor.y, _anchor.x + _anchor.width, _anchor.y + _anchor.height);
            const lines = anchorBoundingRect.getLines();
            lines.forEach((_l) => {
                boundaryLines.push(_l);
            });
        });

        return boundaryLines;
    };    

    const hasEntityMutated = function(_old, _new) {
        if(_old.x !== _new.x || _old.y !== _new.y || _old.width !== _new.width || _old.height !== _new.height) {
            return true;
        }

        return false;
    };

    /**
     * 
     * @param {Point} _point 
     * @returns {PointInfo|null}
     */
    const fetchPointInfoForPoint = function(_point) {
        for (let [_eid, _pvMap] of entityIdToPointVisibility) {
            for (let [_routingPoint, _visiblePoints] of _pvMap) {
                if(_routingPoint === _point) {
                    return buildPointInfo(_routingPoint, _visiblePoints);
                }
            }
        }

        return null;
    };

    /**
     * 
     * @param {Point} _pt 
     * @param {VisiblePoints} _visiblePoints
     * @returns {PointInfo}
     */
    const buildPointInfo = function(_pt, _visiblePoints) {
        const result = Object.create(PointInfo);
        result.point = _pt;
        result.visiblePoints = _visiblePoints;
        return result;
    };

    /**
     * 
     * @param {Object[]} _entityDescriptor 
     * @param {Object[]} _allSiblingDescriptors 
     * @param {Number} _gridSize 
     * @param {Number} _boundingExtentRoutingPointScaleFactor 
     */
    const buildEmptyRoutingPointToVisibleSetMap = function(_entityDescriptor, _allSiblingDescriptors, _gridSize, _boundingExtentRoutingPointScaleFactor) {
        const entityBoundingRect = new Rectangle(_entityDescriptor.x, _entityDescriptor.y, _entityDescriptor.x + _entityDescriptor.width, _entityDescriptor.y + _entityDescriptor.height);
        const foundPoints = AccessibleRoutingPointsFinder.find([_entityDescriptor], _allSiblingDescriptors, _gridSize);
        const routingPoints = foundPoints.accessibleRoutingPoints.toArray();
        const routingPointToVisibleSet = new Map();

        for(let j=0; j<routingPoints.length; j++) {
            routingPointToVisibleSet.set(routingPoints[j], { isValid:false, points:[] });
        }

        // bounding extent routing points
        const scaledPoints = entityBoundingRect.getPointsScaledToGrid(_gridSize * _boundingExtentRoutingPointScaleFactor);
        scaledPoints.forEach((_sp) => {
            routingPointToVisibleSet.set(_sp, { isValid:false, points:[] });
        }); 

        return routingPointToVisibleSet;
    };

    const invalidateSiblingPointVisibilityForMutatedEntities = function(_mutatedEntityIds, _gridSize) {
        const allEntityDescriptors = [];
        for (const [_eid, _descriptor] of entityIdToDescriptor) {
            allEntityDescriptors.push(_descriptor);
        }

        for(let m=0; m<_mutatedEntityIds.length; m++) {
            const descriptor = entityIdToDescriptor.get(_mutatedEntityIds[m]);
            const boundingRect = new Rectangle(descriptor.x, descriptor.y, descriptor.x + descriptor.width, descriptor.y + descriptor.height);

            for(let i=0; i<allEntityDescriptors.length-1; i++) {
                for(let j=i+1; j<allEntityDescriptors.length; j++) {
                    const spanningRect = new Rectangle(
                        Math.min(allEntityDescriptors[i].outerBoundingRect.minX, allEntityDescriptors[j].outerBoundingRect.minX),
                        Math.min(allEntityDescriptors[i].outerBoundingRect.minY, allEntityDescriptors[j].outerBoundingRect.minY),
                        Math.max(allEntityDescriptors[i].outerBoundingRect.maxX, allEntityDescriptors[j].outerBoundingRect.maxX),
                        Math.max(allEntityDescriptors[i].outerBoundingRect.maxY, allEntityDescriptors[j].outerBoundingRect.maxY),
                    );

                    if(boundingRect.checkIntersect(spanningRect)) {
                        entityIdToPointVisibility.set(allEntityDescriptors[i].id, buildEmptyRoutingPointToVisibleSetMap(allEntityDescriptors[i], allEntityDescriptors, _gridSize));
                        entityIdToPointVisibility.set(allEntityDescriptors[j].id, buildEmptyRoutingPointToVisibleSetMap(allEntityDescriptors[j], allEntityDescriptors, _gridSize));
                    }
                }
            }
        }
    };

    /**
     * 
     * @param {Object[]} _entityDescriptors 
     * @param {Number} _gridSize 
     * @param {Number} _boundingExtentRoutingPointScaleFactor 
     */
    this.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors = function(_entityDescriptors, _gridSize, _boundingExtentRoutingPointScaleFactor) {
        if(typeof _boundingExtentRoutingPointScaleFactor === 'undefined') {
            _boundingExtentRoutingPointScaleFactor = 1.0;
        }

        currentNumRoutingPoints = 0;
        currentNumOfBoundaryLines = 0;

        const aliveEntityIds = [];
        const mutatedEntityIds = []; // a mutation is considered any addition, removal, or change
        const deletedEntityIds = [];

        // update boundary lines
        for(let i=0; i<_entityDescriptors.length; i++) {
            const entityId = _entityDescriptors[i].id;
            aliveEntityIds.push(entityId);

            const existingEntry = entityIdToBoundaryLineSet.get(entityId);
            const existingDescriptor = entityIdToDescriptor.get(entityId);
            if(existingEntry && !hasEntityMutated(existingDescriptor, _entityDescriptors[i])) {
                currentNumOfBoundaryLines += existingEntry.count();
                continue;
            }

            const boundaryLinesForEntity = getBoundaryLinesFromEntityDescriptor(_entityDescriptors[i]);
            entityIdToBoundaryLineSet.set(entityId, boundaryLinesForEntity);

            currentNumOfBoundaryLines += boundaryLinesForEntity.count();
        }

        // update routing points
        for(let i=0; i<_entityDescriptors.length; i++) {
            const entityId = _entityDescriptors[i].id;
            const existingDescriptor = entityIdToDescriptor.get(entityId);
            if(existingDescriptor && !hasEntityMutated(existingDescriptor, _entityDescriptors[i])) {
                // This entity hasn't changed, but other mutated entities may have changed what's visible from this entity
                //continue;
            }

            // Entity has been mutated, all routing points for the entity are invalid
            // .. also the inverse relationship (sibling routing points that point to this entity) are also invalid
            const routingPointToVisibleSet = buildEmptyRoutingPointToVisibleSetMap(_entityDescriptors[i], _entityDescriptors, _gridSize, _boundingExtentRoutingPointScaleFactor);
            entityIdToPointVisibility.set(entityId, routingPointToVisibleSet);

            entityIdToDescriptor.set(entityId, _entityDescriptors[i]); // take advantage of this loop to also, finally, update descriptors as we're done with mutation checks

            mutatedEntityIds.push(entityId);
            currentNumRoutingPoints += routingPointToVisibleSet.size;
        }

        // deal with dead entities
        for (let [_eid, _descriptor] of entityIdToDescriptor) {
            if(aliveEntityIds.includes(_eid)) {
                continue;
            }

            // something has been remove, what gets invalidated?
            // .. if visibility computations are alway nulled/reset, nothing else necessary
            // .. else, need to figure out which computations are to be invalidated (overlapping rects tell if relationship between 2 entities is affected)
            // .... this applies to additions and mutations as well

            mutatedEntityIds.push(_eid);
            deletedEntityIds.push(_eid);
        }

        // for future optimization..
        //invalidateSiblingPointVisibilityForMutatedEntities(mutatedEntityIds, _gridSize);

        deletedEntityIds.forEach((_eid) => {
            entityIdToDescriptor.delete(_eid);
            entityIdToBoundaryLineSet.delete(_eid);
            entityIdToPointVisibility.delete(_eid);
        });

        return mutatedEntityIds.length;
    };

    /**
     * @returns {Number}
     */
    this.getCurrentNumRoutingPoints = function() {
        return currentNumRoutingPoints;
    };

    /**
     * @returns {Number}
     */    
    this.getCurrentNumBoundaryLines = function() {
        return currentNumOfBoundaryLines;
    };

    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findVisiblePointInfoClosestTo = function(_point) {
        var result = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        for (let [_eid, _pvMap] of entityIdToPointVisibility) {
            for (let [_routingPoint, _visiblePoints] of _pvMap) {
                const lineOfSight = new Line(_point, _routingPoint);
                const lineOfSightLength = lineOfSight.getLength();
    
                if(lineOfSightLength < currentMaxLength && !doesLineIntersectAnyBoundaryLines(lineOfSight)) {
                    result = buildPointInfo(_routingPoint, _visiblePoints);
                    currentMaxLength = lineOfSightLength;
                };
            }
        }

        return result;
    };

    /**
     * @param {Point} _startPoint
     * @param {Point} _endPoint
     * @param {Boolean} _optimizeRoute
     * 
     * @return {PointSet}
     */
    this.computeRoute = function(_startPoint, _endPoint, _optimizeRoute) {
        // if no valid startpoint or endpoint, we can't route
        if(_startPoint === null || _endPoint === null) {
            return new PointSet();
        }

        // find closest visible point 
        const firstPointInfo = self.findVisiblePointInfoClosestTo(_startPoint);
        if(firstPointInfo === null) {
            return new PointSet();
        }

        const vecStartToEnd = (new Vec2(_endPoint.getX() - _startPoint.getX(), _endPoint.getY() - _startPoint.getY())).normalize();

        const pointsInRoute = [firstPointInfo.point];
        let currentRouteLen = 0;
        let currentPointInfo = firstPointInfo;
        while(true) {
            const routeSegment = routeToEndpoint(currentRouteLen, pointsInRoute, currentPointInfo, _startPoint, _endPoint, vecStartToEnd);
            if(routeSegment === null) {
                // Is there unobstructed line to endpoint? 
                // If not, failed to find route
                const lastSegmentToEndpoint = new Line(pointsInRoute[pointsInRoute.length-1], _endPoint);
                if(doesLineIntersectAnyBoundaryLines(lastSegmentToEndpoint)) {
                    return new PointSet();
                }

                break;
            }

            // update cur path length
            currentRouteLen += (new Line(currentPointInfo.point, routeSegment.point)).getLength();

            // add new point to path
            pointsInRoute.push(routeSegment.point);

            // update current point index
            currentPointInfo = fetchPointInfoForPoint(routeSegment.point);

            // check if we're done
            if((new Line(currentPointInfo.point, _endPoint).getLength()) < 1.0) {
                break;
            }
        }

        if(_optimizeRoute) {
            PointVisibilityMapRouteOptimizer.optimize(pointsInRoute, arePointsVisibleToEachOther);
        }

        return new PointSet(pointsInRoute);
    };
};
   
export { PointVisibilityMap };
