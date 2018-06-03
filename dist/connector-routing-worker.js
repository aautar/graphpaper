(function () {
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

    const self = this;

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
     * @param {Line} _otherLine
     * @returns {Boolean}
     */
    this.isEqual = function(_otherLine) {
        if(self.getStartPoint().isEqual(_otherLine.getStartPoint()) && self.getEndPoint().isEqual(_otherLine.getEndPoint())) {
            return true;
        }

        return false;
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
 * @param {Point[]|Float64Array|undefined} _pointsInput
 */
function PointSet(_pointsInput) {

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
    const fromFloat64Array = function(_float64Array) {
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

    if(_pointsInput && Array.isArray(_pointsInput)) {
        _pointsInput.forEach(self.push);
    } else if(_pointsInput && Object.prototype.toString.call(_pointsInput) === '[object Float64Array]') {
        fromFloat64Array(_pointsInput);
    } else { }    

}

/**
 * Unique collection of Line objects
 * 
 * @param {Line[]|Float64Array|undefined} _linesInput
 */
function LineSet(_linesInput) {

    const self = this;
    
    /**
     * @type {Line[]}
     */
    const lines = [];    

    /**
     * @param {Line} _newLine
     */
    this.push = function(_newLine) {
        var alreadyInLinesArray = false;
        lines.forEach(function(_existingLine) {
            if(_newLine.isEqual(_existingLine)) {
                alreadyInLinesArray = true;
            }
        });        

        if(alreadyInLinesArray) {
            return false;
        }

        lines.push(_newLine);
        return true;
    };
  
    /**
     * @returns {Line[]}
     */
    this.toArray = function() {
        return lines;
    };

    /**
     * @returns {Number}
     */
    this.count = function() {
        return lines.length;
    };

    /**
     * @returns {Float64Array}
     */
    this.toFloat64Array = function() {
        const result = new Float64Array(lines.length * 4);
        for(let i=0; i<lines.length; i++) {
            result[0 + (i*4)] = lines[i].getStartPoint().getX();
            result[1 + (i*4)] = lines[i].getStartPoint().getY();
            result[2 + (i*4)] = lines[i].getEndPoint().getX();
            result[3 + (i*4)] = lines[i].getEndPoint().getY();
        }

        return result;
    };

    /**
     * @param {Float64Array} _float64Array
     */
    const fromFloat64Array = function(_float64Array) {
        lines.length = 0;
        for(let i=0; i<_float64Array.length; i+=4) {
            lines.push(
                new Line(
                    new Point(_float64Array[i], _float64Array[i+1]),
                    new Point(_float64Array[i+2], _float64Array[i+3])
                )
            );
        }
    };

    if(_linesInput && Array.isArray(_linesInput)) {
        _linesInput.forEach(self.push);
    } else if(_linesInput && Object.prototype.toString.call(_linesInput) === '[object Float64Array]') {
        fromFloat64Array(_linesInput);
    } else { }    
}

/**
 * 
 * @param {PointSet} _freePoints
 * @param {LineSet} _boundaryLines
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

        const lines = _boundaryLines.toArray();

        for(let b=0; b<lines.length; b++) {
            const intersectionType = lines[b].computeIntersectionType(_theLine);
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

/**
 * 
 * @param {Point} _pt 
 * @returns {String}
 */
const pointToSvgLineTo = function(_pt) {
    return "L" + _pt.getX() + " " + _pt.getY();
};

/**
 * 
 * @param {Object} _connectorDescriptor
 * @param {PointSet} _anchorPoints
 * @param {PointVisibilityMap} _pointVisibilityMap 
 * 
 * @returns {String}
 */
const computeConnectorSvg = function(_connectorDescriptor, _anchorPoints, _pointVisibilityMap) {

    const anchorStartStringParts = _connectorDescriptor.anchor_start_centroid.split(' ');
    const anchorEndStringParts = _connectorDescriptor.anchor_end_centroid.split(' ');

    const anchorStartCentroid = new Point(anchorStartStringParts[0], anchorStartStringParts[1]);
    const anchorEndCentroid = new Point(anchorEndStringParts[0], anchorEndStringParts[1]);
    const anchorPointMinDist = _anchorPoints.findDistanceToPointClosestTo(anchorStartCentroid);

    const adjustedStart = _anchorPoints
        .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorEndCentroid);

    const adjustedEnd = _anchorPoints
        .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorStartCentroid);

    const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
    const routingPointsArray = routingPoints.toArray();

    const lineToString = [];
    routingPointsArray.forEach(function(_rp) {
        lineToString.push(pointToSvgLineTo(_rp));
    });

    lineToString.push(pointToSvgLineTo(anchorEndCentroid));

    const startCoordString = anchorStartCentroid.getX() + " " + anchorStartCentroid.getY();
    const pathString = 'M' + startCoordString + lineToString.join(" ");

    return pathString;
};

onmessage = function(_msg) {

    const gridSize = _msg.data.gridSize;

    const connectorDescriptors = _msg.data.connectorDescriptors;

    const routingPointsArrayBuffer = _msg.data.routingPoints;
    const routingPointsFloat64Array = new Float64Array(routingPointsArrayBuffer);
    const routingPointsSet = new PointSet(routingPointsFloat64Array);

    const boundaryLinesArrayBuffer = _msg.data.boundaryLines;
    const boundaryLinesFloat64Array = new Float64Array(boundaryLinesArrayBuffer);
    const boundaryLinesSet = new LineSet(boundaryLinesFloat64Array);    

    const anchorPointsArrayBuffer = _msg.data.anchorPoints;
    const anchorPointsFloat64Array = new Float64Array(anchorPointsArrayBuffer);
    const anchorPointsSet = new PointSet(anchorPointsFloat64Array);    
    
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );

    connectorDescriptors.forEach(function(_cd) {
        _cd.svgPath = computeConnectorSvg(_cd, anchorPointsSet, currentPointVisiblityMap);
    });

    postMessage(
        {
            "connectorDescriptors": connectorDescriptors
        }
    );

};

}());