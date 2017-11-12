import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {PointSet} _freePoints
 * @param {Line[]} _boundaryLines
 */
function PointVisibilityMap(_freePoints, _boundaryLines) {

    const self = this;

    /**
     * @type Map<Point,Point[]>
     */
    const pointToVisiblePointSet = new Map();

    /**
     * @param {Line} _theLine
     * @returns {Boolean}
     */
    const doesLineIntersectAnyBoundaryLines = function(_theLine) {
        for(let b=0; b<_boundaryLines.length; b++) {
            const intersection = _boundaryLines[b].computeIntersection(_theLine);
            if(intersection.getType() === LINE_INTERSECTION_TYPE.LINESEG) {
                return true;
            }
        };

        return false;
    };

    const computePointsVisibility = function() {

        const freePointsArray = _freePoints.toArray();

        if(freePointsArray.length === 1) {
            pointToVisiblePointSet.set(freePointsArray[0], []);
            return;
        }

        for(let i=0; i<freePointsArray.length; i++) {
            
            pointToVisiblePointSet.set(freePointsArray[i], []);

            for(let j=0; j<freePointsArray.length; j++) {
                if(i===j) {
                    continue;
                }

                // line representing line-of-sight between the 2 points
                const ijLine = new Line(freePointsArray[i], freePointsArray[j]);

                if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                    const visiblePoints = pointToVisiblePointSet.get(freePointsArray[i]);
                    visiblePoints.push(freePointsArray[j]);

                    pointToVisiblePointSet.set(
                        freePointsArray[i], 
                        visiblePoints
                    );
                }
            }
        }
    };

    /**
     * 
     * @param {Map<Point,Number>} _visiblePointToCost 
     */
    const getMinimumCostPointFromMap = function(_visiblePointToCost) {
        var minCost = Number.MAX_SAFE_INTEGER;
        var pointWithMinCost = null;
        for (var [_vp, _cost] of _visiblePointToCost.entries()) {
            if(_cost < minCost) {
                pointWithMinCost = _vp;
                minCost = _cost;
            }
        }

        if (pointWithMinCost === null) {
            return null;
        }

        return {
            "cost": minCost,
            "point": pointWithMinCost
        };
    };

    /**
     * 
     * @param {Number} _currentRouteLength 
     * @param {Point[]} _pointsInRoute 
     * @param {Point} _currentPoint 
     * @param {Point} _endPoint 
     */
    const routeToEndpoint = function(_currentRouteLength, _pointsInRoute, _currentPoint, _endPoint) {

        const visiblePointToCost = new Map();
        var visiblePoints = pointToVisiblePointSet.get(_currentPoint);

        // filter out _pointsInRoute
        visiblePoints = visiblePoints.filter(function(_vp) {
            for(let i=0; i<_pointsInRoute.length; i++) {
                if(_vp.isEqual(_pointsInRoute[i])) {
                    return false;
                }
            }
            return true;
        });
        

        visiblePoints.forEach(function(_vp) {
            // g(n) = length/cost of _startPoint to _vp + _currentRouteLength
            const gn = (new Line(_currentPoint, _vp)).getLength() + _currentRouteLength;

            // h(n) = length/cost of _vp to _endPoint
            const hn = (new Line(_vp, _endPoint)).getLength();

            visiblePointToCost.set(_vp, gn + hn);
        });

        const nextPoint = getMinimumCostPointFromMap(visiblePointToCost);
        if(nextPoint === null) {
            return null;
        }

        return nextPoint;
    };

    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findPointClosestTo = function(_point) {
        var resultPoint = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        pointToVisiblePointSet.forEach(function(_visiblePoints, _ptKey) {
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

        pointToVisiblePointSet.forEach(function(_visiblePoints, _ptKey) {
            const lineOfSight = new Line(_point, _ptKey);
            if(!doesLineIntersectAnyBoundaryLines(lineOfSight)) {
                if(lineOfSight.getLength() < currentMaxLength) {
                    resultPoint = _ptKey;
                    currentMaxLength = lineOfSight.getLength();
                }
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

        // find closest visible point in pointToVisiblePointSet
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
                break;
            }

            currentRouteLen += (new Line(currentPoint, routeSegment.point)).getLength();
            pointsInRoute.push(routeSegment.point);
            currentPoint = routeSegment.point;

            if((new Line(currentPoint, _endPoint).getLength()) < 1.0) {
                break;
            }
        }


        return new PointSet(pointsInRoute);

    };

    computePointsVisibility();
};
    
export { PointVisibilityMap };
