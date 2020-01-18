import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import {LineSet} from './LineSet';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {PointSet} _freePoints
 * @param {LineSet} _boundaryLines
 */
function PointVisibilityMap(_freePoints, _boundaryLines) {

    const self = this;

    const boundaryLinesArr = _boundaryLines.toArray();
    const freePointsArr = _freePoints.toArray();
    const pointToVisibleSet = new Array(_freePoints.count()); // index represents entry in freePointsArr

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

    const computePointsVisibility = function() {
        for(let i=0; i<freePointsArr.length; i++) {
            pointToVisibleSet[i] = [];   
        }

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
    };

    const getVisiblePointsFrom = function(_currentPoint) {
        for(let i=0; i<freePointsArr.length; i++) {

            if(freePointsArr[i].isEqual(_currentPoint)) {
                const visiblePointIndices = pointToVisibleSet[i];
                const visiblePoints = [];
                visiblePointIndices.forEach((_vpIdx) => {
                    visiblePoints.push(freePointsArr[_vpIdx]);
                });

                return visiblePoints;
            }            
        }

        return [];
    };

    /**
     * 
     * @param {Number} _currentRouteLength 
     * @param {Point[]} _pointsInRoute 
     * @param {Point} _currentPoint 
     * @param {Point} _endPoint 
     * @returns {Object|null}
     */
    const routeToEndpoint = function(_currentRouteLength, _pointsInRoute, _currentPoint, _endPoint) {

        var visiblePoints = getVisiblePointsFrom(_currentPoint);       
        var curMinCost = Number.MAX_SAFE_INTEGER;
        var visiblePointWithMinCost = null;

        visiblePoints.forEach(function(_vp) {
            // ignore point if it's already in the route
            for(let i=0; i<_pointsInRoute.length; i++) {
                if(_vp.isEqual(_pointsInRoute[i])) {
                    return; // point already in route, try another
                }
            }

            // g(n) = length/cost of _startPoint to _vp + _currentRouteLength
            const gn = (new Line(_currentPoint, _vp)).getLength() + _currentRouteLength;

            // h(n) = length/cost of _vp to _endPoint
            const hn = (new Line(_vp, _endPoint)).getLength();

            // see if this is the new min
            if((gn + hn) < curMinCost) {
                curMinCost = gn + hn;
                visiblePointWithMinCost = _vp;
            }
        });

        if(curMinCost === Number.MAX_SAFE_INTEGER) {
            return null;
        }

        return {
            "cost": curMinCost,
            "point": visiblePointWithMinCost
        };
    };

    /**
     * 
     * @param {Array} _pointsInRoute 
     */
    const optimizeRoute = function(_pointsInRoute) {

        let ptrA = 0;

        while(true) {

            if(ptrA+2 >= _pointsInRoute.length) {
                break;
            }            

            const ln = new Line(_pointsInRoute[ptrA], _pointsInRoute[ptrA + 2]);

            if(!doesLineIntersectAnyBoundaryLines(ln)) {
                _pointsInRoute.splice(ptrA + 1, 1);
            } else {
                ptrA++;
            }

        }

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
     * @param {Point} _startPoint
     * @param {Point} _endPoint
     * 
     * @return {PointSet}
     */
    this.computeRoute = function(_startPoint, _endPoint) {

        // if no valid startpoint or endpoint, we can't route
        if(_startPoint === null || _endPoint === null) {
            return new PointSet();
        }

        // find closest visible point 
        const firstRoutingPoint = self.findVisiblePointClosestTo(_startPoint);
        if(firstRoutingPoint === null) {
            return new PointSet();
        }

        var currentRouteLen = 0;
        const pointsInRoute = [firstRoutingPoint];
        var currentPoint = firstRoutingPoint;
        while(true) {
            const routeSegment = routeToEndpoint(currentRouteLen, pointsInRoute, currentPoint, _endPoint);
            if(routeSegment === null) {

                // Is there unobstructed line to endpoint? 
                // If not, failed to find route
                const lastSegmentToEndpoint = new Line(pointsInRoute[pointsInRoute.length-1], _endPoint);
                if(doesLineIntersectAnyBoundaryLines(lastSegmentToEndpoint)) {
                    return new PointSet();
                }

                break;
            }

            currentRouteLen += (new Line(currentPoint, routeSegment.point)).getLength();
            pointsInRoute.push(routeSegment.point);
            currentPoint = routeSegment.point;

            if((new Line(currentPoint, _endPoint).getLength()) < 1.0) {
                break;
            }
        }

        optimizeRoute(pointsInRoute);

        return new PointSet(pointsInRoute);

    };

    computePointsVisibility();
};
    
export { PointVisibilityMap };
