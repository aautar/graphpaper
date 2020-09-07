import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import {PointVisibilityMapRouteOptimizer} from './PointVisibilityMapRouteOptimizer';
import {LineSet} from './LineSet';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {PointSet} _freePoints
 * @param {LineSet} _boundaryLines
 * @param {Array|undefined} _precomputedPointToVisibleSet
 */
function PointVisibilityMap(_freePoints, _boundaryLines, _precomputedPointToVisibleSet) {
    const self = this;

    const boundaryLinesArr = _boundaryLines.toArray();
    const freePointsArr = _freePoints.toArray();
    let pointToVisibleSet = null;

    /**
     * @param {Line} _theLine
     * @returns {Boolean}
     */
    const doesLineIntersectAnyBoundaryLines = function(_theLine) {
        for(let b=0; b<boundaryLinesArr.length; b++) {
            const intersectionType = boundaryLinesArr[b].computeIntersectionType(_theLine);
            if(intersectionType === LINE_INTERSECTION_TYPE.LINESEG) {
                return true;
            }
        };

        return false;
    };

    const initPointsVisibility = function() {
        for(let i=0; i<freePointsArr.length; i++) {
            pointToVisibleSet[i] = null;   
        }

        // We can do the following to compute the entire PV map on init
        /*
        for(let i=0; i<freePointsArr.length; i++) {            
            for(let j=i+1; j<freePointsArr.length; j++) {

                // line representing line-of-sight between the 2 points
                const ijLine = new Line(freePointsArr[i], freePointsArr[j]);

                if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                    // record indices into freePointsArr
                    pointToVisibleSet[i].push(j);
                    pointToVisibleSet[j].push(i);
                }
            }
        }
        */
    };

    const computePointsVisibilityForIndex = function(_idx) {
        pointToVisibleSet[_idx] = [];
        for(let j=0; j<freePointsArr.length; j++) {
            if(_idx === j) {
                continue;
            }

            // line representing line-of-sight between the 2 points
            const ijLine = new Line(freePointsArr[_idx], freePointsArr[j]);

            if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                // record indices into freePointsArr
                pointToVisibleSet[_idx].push(j);
            }
        }

        return pointToVisibleSet[_idx];
    };

    const arePointsVisibleToEachOther = function(_ptA, _ptB) {
        for(let i=0; i<freePointsArr.length; i++) {
            if(freePointsArr[i].isEqual(_ptA)) {
                let visiblePointIndices = pointToVisibleSet[i];
                if(visiblePointIndices === null) {
                    visiblePointIndices = computePointsVisibilityForIndex(i);
                }

                for(let j=0; j<visiblePointIndices.length; j++) {
                    if(freePointsArr[visiblePointIndices[j]].isEqual(_ptB)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * 
     * @param {Number} _currentPointIndex
     * @returns {Point[]}
     */
    const getVisiblePointsRelativeTo = function(_pointIndex) {
        if(pointToVisibleSet[_pointIndex] === null) {
            computePointsVisibilityForIndex(_pointIndex);
        }
        
        return pointToVisibleSet[_pointIndex];
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
     * @param {Number} _currentPointIndex 
     * @param {Point} _endPoint 
     * @returns {Object|null}
     */
    const routeToEndpoint = function(_currentRouteLength, _pointsInRoute, _currentPointIndex, _endPoint) {
        const currentPoint = freePointsArr[_currentPointIndex];
        const visiblePointIndices = getVisiblePointsRelativeTo(_currentPointIndex);
        var curMinCost = Number.MAX_SAFE_INTEGER;
        var visiblePointWithMinCost = null;
        var visiblePointWithMinCostIndex = null;

        for(let i=0; i<visiblePointIndices.length; i++) {
            const visiblePt = freePointsArr[visiblePointIndices[i]];

            // ignore point if it's already in the route
            if(isPointInArray(visiblePt, _pointsInRoute)) {
                continue;
            }

            // g(n) = length/cost of _startPoint to _vp + _currentRouteLength
            const gn = (new Line(currentPoint, visiblePt)).getLength() + _currentRouteLength;

            // h(n) = length/cost of _vp to _endPoint
            const hn = (new Line(visiblePt, _endPoint)).getLength();

            // see if this is the new min
            if((gn + hn) < curMinCost) {
                curMinCost = gn + hn;
                visiblePointWithMinCost = visiblePt;
                visiblePointWithMinCostIndex = visiblePointIndices[i];
            }
        }

        if(curMinCost === Number.MAX_SAFE_INTEGER) {
            return null;
        }

        return {
            "cost": curMinCost,
            "point": visiblePointWithMinCost,
            "pointIndex": visiblePointWithMinCostIndex
        };
    };

    /**
     * @returns {Array}
     */
    this.getPointToVisibleSetData = function() {
        return pointToVisibleSet;
    };

    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findPointClosestTo = function(_point) {
        var resultPoint = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        freePointsArr.forEach(function(_ptKey) {
            const lineOfSight = new Line(_point, _ptKey);
            if(lineOfSight.getLength() < currentMaxLength) {
                resultPoint = _ptKey;
                currentMaxLength = lineOfSight.getLength();
            }
        });
        
        return resultPoint;
    };

    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findVisiblePointClosestTo = function(_point) {
        var resultPoint = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        freePointsArr.forEach(function(_freePt) {

            const lineOfSight = new Line(_point, _freePt);
            const lineOfSightLength = lineOfSight.getLength();

            if(lineOfSightLength < currentMaxLength && !doesLineIntersectAnyBoundaryLines(lineOfSight)) {
                resultPoint = _freePt;
                currentMaxLength = lineOfSightLength;
            };

        });
        
        return resultPoint;
    };

    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findVisiblePointIndexClosestTo = function(_point) {
        var resultPointIndex = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        for(let i=0; i<freePointsArr.length; i++) {
            const freePt = freePointsArr[i];

            const lineOfSight = new Line(_point, freePt);
            const lineOfSightLength = lineOfSight.getLength();

            if(lineOfSightLength < currentMaxLength && !doesLineIntersectAnyBoundaryLines(lineOfSight)) {
                resultPointIndex = i;
                currentMaxLength = lineOfSightLength;
            };

        }
        
        return resultPointIndex;
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
        const firstRoutingPointIndex = self.findVisiblePointIndexClosestTo(_startPoint);
        if(firstRoutingPointIndex === null) {
            return new PointSet();
        }

        var currentRouteLen = 0;
        const firstRoutingPoint = freePointsArr[firstRoutingPointIndex];
        const pointsInRoute = [firstRoutingPoint];
        var currentPointIndex = firstRoutingPointIndex;
        while(true) {
            const routeSegment = routeToEndpoint(currentRouteLen, pointsInRoute, currentPointIndex, _endPoint);
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
            currentRouteLen += (new Line(freePointsArr[currentPointIndex], routeSegment.point)).getLength();

            // add new point to path
            pointsInRoute.push(routeSegment.point);

            // update current point index
            currentPointIndex = routeSegment.pointIndex;

            // check if we're done
            if((new Line(freePointsArr[currentPointIndex], _endPoint).getLength()) < 1.0) {
                break;
            }
        }

        if(_optimizeRoute) {
            PointVisibilityMapRouteOptimizer.optimize(pointsInRoute, arePointsVisibleToEachOther);
        }

        return new PointSet(pointsInRoute);
    };

    if(_precomputedPointToVisibleSet) {
        pointToVisibleSet = _precomputedPointToVisibleSet;
    } else {
        pointToVisibleSet = new Array(_freePoints.count()); // index represents entry in freePointsArr
        initPointsVisibility();        
    }
};
   
export { PointVisibilityMap };
