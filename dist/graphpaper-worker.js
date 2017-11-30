var GraphPaperWorker = (function (exports) {
'use strict';

/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {

    /**
     * @returns {Number}
     */       
    this.getX = function() {
        return _x;
    };

    /**
     * @returns {Number}
     */       
    this.getY = function() {
        return _y;
    };

    /**
     * @param {Point} _otherPoint
     * @returns {Boolean}
     */
    this.isEqual = function(_otherPoint) {
        if(_x === _otherPoint.getX() && _y === _otherPoint.getY()) {
            return true;
        }

        return false;
    };

    /**
     * @returns {Point}
     */
    this.getCartesianPoint = function(_canvasWidth, _canvasHeight) {
        return new Point(
            _x - (_canvasWidth * 0.5),
            -_y + (_canvasHeight * 0.5)
        );
    };

    /**
     * @returns {String}
     */
    this.toString = function() {
        return _x + " " + _y;
    };
}

const LINE_INTERSECTION_TYPE = Object.freeze({
	PARALLEL: "parallel",		// no intersection, lines are parallel
    COINCIDENT: "coincident",	// no intersection, lines are coincident
	LINE: "line",				// the lines intersect, but the intersection point is beyond the bounds of the line segments
	LINESEG: "lineseg",			// the lines intersect, and the intersection point is within the bounds of the line segments
});

/**
 * 
 * @param {LINE_INTERSECTION_TYPE} _type 
 * @param {Point} _intersectionPoint 
 */
function LineIntersection(_type, _intersectionPoint) {

    /**
     * @returns {LINE_INTERSECTION_TYPE}
     */
    this.getType = function() {
        return _type;
    };

    /**
     * @returns {Point|null}
     */
    this.getIntersectionPoint = function() {
        return _intersectionPoint;
    };
}

/**
 * 
 * @param {Point} _startPoint
 * @param {Point} _endPoint
 */
function Line(_startPoint, _endPoint) {   
    /**
     * @returns {Point}
     */       
    this.getStartPoint = function() {
        return _startPoint;
    };

    /**
     * @returns {Point}
     */       
    this.getEndPoint = function() {
        return _endPoint;
    };

    /**
     * @returns {Number}
     */
    this.getLength = function() {
        return Math.sqrt(
            Math.pow(_endPoint.getX() - _startPoint.getX(), 2) + Math.pow(_endPoint.getY() - _startPoint.getY(), 2)
        );
    };

    /**
     * @param {Line} _otherLine
     * @returns {LINE_INTERSECTION_TYPE}
     */
    this.computeIntersectionType = function(_otherLine) {
        const thisLineStartPointX = _startPoint.getX();
        const thisLineStartPointY = _startPoint.getY();
        const thisLineEndPointX = _endPoint.getX();
        const thisLineEndPointY = _endPoint.getY();        
        const otherLineStartPointX = _otherLine.getStartPoint().getX();
        const otherLineStartPointY = _otherLine.getStartPoint().getY();
        const otherLineEndPointX = _otherLine.getEndPoint().getX();
        const otherLineEndPointY = _otherLine.getEndPoint().getY();

        const paramDenom = (otherLineEndPointY-otherLineStartPointY)*(thisLineEndPointX-thisLineStartPointX) - (otherLineEndPointX-otherLineStartPointX)*(thisLineEndPointY-thisLineStartPointY);
        const paramANumer = (otherLineEndPointX-otherLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (otherLineEndPointY - otherLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);
        const paramBNumer = (thisLineEndPointX-thisLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (thisLineEndPointY-thisLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);

        if(paramDenom == 0) {
            if(paramDenom == 0 && paramANumer == 0 && paramBNumer==0)
                return LINE_INTERSECTION_TYPE.COINCIDENT;
            else
                return LINE_INTERSECTION_TYPE.PARALLEL;
        }

        const paramA = paramANumer / paramDenom;
        const paramB = paramBNumer / paramDenom;
       
        if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
            return LINE_INTERSECTION_TYPE.LINE;
        } else {
            return LINE_INTERSECTION_TYPE.LINESEG;
        }
    };
        
    /**
     * @param {Line} _otherLine
     * @returns {LINE_INTERSECTION_RESULT}
     */
    this.computeIntersection = function(_otherLine) {

        const thisLineStartPointX = _startPoint.getX();
        const thisLineStartPointY = _startPoint.getY();
        const thisLineEndPointX = _endPoint.getX();
        const thisLineEndPointY = _endPoint.getY();        
        const otherLineStartPointX = _otherLine.getStartPoint().getX();
        const otherLineStartPointY = _otherLine.getStartPoint().getY();
        const otherLineEndPointX = _otherLine.getEndPoint().getX();
        const otherLineEndPointY = _otherLine.getEndPoint().getY();

        const paramDenom = (otherLineEndPointY-otherLineStartPointY)*(thisLineEndPointX-thisLineStartPointX) - (otherLineEndPointX-otherLineStartPointX)*(thisLineEndPointY-thisLineStartPointY);
        const paramANumer = (otherLineEndPointX-otherLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (otherLineEndPointY - otherLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);
        const paramBNumer = (thisLineEndPointX-thisLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (thisLineEndPointY-thisLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);
    
        if(paramDenom == 0) {
            if(paramDenom == 0 && paramANumer == 0 && paramBNumer==0)
                return new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT, null);
            else
                return new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL, null);
        }

        const paramA = paramANumer / paramDenom;
        const paramB = paramBNumer / paramDenom;
   
        const xIntersect = _startPoint.getX() + paramA*(_endPoint.getX()-_startPoint.getX());
        const yIntersect = _startPoint.getY() + paramA*(_endPoint.getY()-_startPoint.getY());
     
        if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
            return new LineIntersection(LINE_INTERSECTION_TYPE.LINE, new Point(xIntersect, yIntersect));
        } else {
            return new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG, new Point(xIntersect, yIntersect));
        }
    };
}

/**
 * Unique collection of Point objects
 * 
 * @param {Point[]|undefined} _points
 */
function PointSet(_points) {

    const self = this;

    /**
     * @type {Point[]}
     */
    const points = [];

    /**
     * @param {Point} _newPoint
     */
    this.push = function(_newPoint) {
        var alreadyInPointsArray = false;
        points.forEach(function(_existingPoint) {
            if(_newPoint.isEqual(_existingPoint)) {
                alreadyInPointsArray = true;
            }
        });        

        if(alreadyInPointsArray) {
            return false;
        }

        points.push(_newPoint);
        return true;
    };

    /**
     * 
     * @param {Point} _point 
     * @returns {Point}
     */
    this.findPointClosestTo = function(_point) {
        var resultPoint = null;
        var currentMinLength = Number.MAX_SAFE_INTEGER;

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() < currentMinLength) {
                resultPoint = _pt;
                currentMinLength = lineToPt.getLength();
            }
        });
        
        return resultPoint;        
    };

    this.findDistanceToPointClosestTo = function(_point) {
        var currentMinLength = Number.MAX_SAFE_INTEGER;

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() < currentMinLength) {
                currentMinLength = lineToPt.getLength();
            }
        });
        
        return currentMinLength;        
    };    

    /**
     * 
     * @param {Point} _point 
     * @returns {PointSet}
     */
    this.findPointsCloseTo = function(_point, _radius) {
        const resultSet = new PointSet();

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() <= _radius) {
                resultSet.push(_pt);
            }
        });
        
        return resultSet;        
    };    

    /**
     * @returns {Point[]}
     */
    this.toArray = function() {
        return points;
    };

    /**
     * @returns {Float64Array}
     */
    this.toFloat64Array = function() {

        const result = new Float64Array(points.length * 2);
        for(let i=0; i<points.length; i++) {
            result[0 + (i*2)] = points[i].getX();
            result[1 + (i*2)] = points[i].getY();
        }

        return result;
    };
    
    /**
     * @param {Float64Array} _float64Array
     */
    this.fromFloat64Array = function(_float64Array) {
        points.length = 0;
        for(let i=0; i<_float64Array.length; i+=2) {
            points.push(
                new Point(_float64Array[i], _float64Array[i+1])
            );
        }
    };    

    /**
     * @returns {Number}
     */
    this.count = function() {
        return points.length;
    };

    if(_points && Array.isArray(_points)) {
        _points.forEach(self.push);
    }

}

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
            const intersectionType = _boundaryLines[b].computeIntersectionType(_theLine);
            if(intersectionType === LINE_INTERSECTION_TYPE.LINESEG) {
                return true;
            }
        }

        return false;
    };

    const computePointsVisibility = function() {

        const freePointsArray = _freePoints.toArray();

        for(let i=0; i<freePointsArray.length; i++) {
            pointToVisiblePointSet.set(freePointsArray[i], []);        
        }

        for(let i=0; i<freePointsArray.length; i++) {            
            for(let j=i+1; j<freePointsArray.length; j++) {

                // line representing line-of-sight between the 2 points
                const ijLine = new Line(freePointsArray[i], freePointsArray[j]);

                if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                    const visiblePointsI = pointToVisiblePointSet.get(freePointsArray[i]);
                    visiblePointsI.push(freePointsArray[j]);
                    pointToVisiblePointSet.set(freePointsArray[i], visiblePointsI);

                    const visiblePointsJ = pointToVisiblePointSet.get(freePointsArray[j]);
                    visiblePointsJ.push(freePointsArray[i]);
                    pointToVisiblePointSet.set(freePointsArray[j], visiblePointsJ);                    
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
            }
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
}

onmessage = function(_msg) {
    const routingPointsArrayBuffer = _msg.data.routingPoints;
    const routingPointsFloat64Array = new Float64Array(routingPointsArrayBuffer);

    const routingPointsSet = new PointSet();
    routingPointsSet.fromFloat64Array(routingPointsFloat64Array);


    console.log(routingPointsSet.count());
};

exports.PointVisibilityMap = PointVisibilityMap;

return exports;

}({}));
