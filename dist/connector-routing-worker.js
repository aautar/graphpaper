(function () {
'use strict';

/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {

    this.__x = _x;
    this.__y = _y;
}

/**
 * @returns {Number}
 */     
Point.prototype.getX = function() {
    return this.__x;
};

/**
 * @returns {Number}
 */     
Point.prototype.getY = function() {
    return this.__y;
};

/**
 * @param {Point} _otherPoint
 * @returns {Boolean}
 */
Point.prototype.isEqual = function(_otherPoint) {
    if(this.__x === _otherPoint.getX() && this.__y === _otherPoint.getY()) {
        return true;
    }

    return false;
};

/**
 * @returns {Point}
 */
Point.prototype.getCartesianPoint = function(_canvasWidth, _canvasHeight) {
    return new Point(
        this.__x - (_canvasWidth * 0.5),
        -this.__y + (_canvasHeight * 0.5)
    );
};

/**
 * @returns {String}
 */
Point.prototype.toString = function() {
    return this.__x + " " + this.__y;
};

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

    if(typeof _startPoint === 'undefined' || _startPoint === null) {
        throw "Line missing _startPoint";
    }

    if(typeof _endPoint === 'undefined' || _endPoint === null) {
        throw "Line missing _endPoint";
    }

    this.__startPoint = _startPoint;
    this.__endPoint = _endPoint;
}


/**
 * @returns {Point}
 */       
Line.prototype.getStartPoint = function() {
    return this.__startPoint;
};

/**
 * @returns {Point}
 */       
Line.prototype.getEndPoint = function() {
    return this.__endPoint;
};

/**
 * @param {Line} _otherLine
 * @returns {Boolean}
 */
Line.prototype.isEqual = function(_otherLine) {
    if(this.getStartPoint().isEqual(_otherLine.getStartPoint()) && this.getEndPoint().isEqual(_otherLine.getEndPoint())) {
        return true;
    }

    return false;
};

/**
 * @returns {Number}
 */
Line.prototype.getLength = function() {
    return Math.sqrt(
        Math.pow(this.__endPoint.getX() - this.__startPoint.getX(), 2) + Math.pow(this.__endPoint.getY() - this.__startPoint.getY(), 2)
    );
};

/**
 * Calculate unit length direction vector
 * 
 * @returns {Point}
 */
Line.prototype.getDirection = function() {
    const dx = this.__endPoint.getX() - this.__startPoint.getX();
    const dy = this.__endPoint.getY() - this.__startPoint.getY();

    const len = Math.sqrt(dx*dx + dy*dy);

    return new Point(       
        dx / len,
        dy / len
    );    
};

/**
 * @param {Line} _otherLine
 * @returns {LINE_INTERSECTION_TYPE}
 */
Line.prototype.computeIntersectionType = function(_otherLine) {
    const thisLineStartPointX = this.__startPoint.getX();
    const thisLineStartPointY = this.__startPoint.getY();
    const thisLineEndPointX = this.__endPoint.getX();
    const thisLineEndPointY = this.__endPoint.getY();        
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
Line.prototype.computeIntersection = function(_otherLine) {

    const thisLineStartPointX = this.__startPoint.getX();
    const thisLineStartPointY = this.__startPoint.getY();
    const thisLineEndPointX = this.__endPoint.getX();
    const thisLineEndPointY = this.__endPoint.getY();        
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

    const xIntersect = this.__startPoint.getX() + paramA*(this.__endPoint.getX()-this.__startPoint.getX());
    const yIntersect = this.__startPoint.getY() + paramA*(this.__endPoint.getY()-this.__startPoint.getY());
    
    if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
        return new LineIntersection(LINE_INTERSECTION_TYPE.LINE, new Point(xIntersect, yIntersect));
    } else {
        return new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG, new Point(xIntersect, yIntersect));
    }
};

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
        for(let i=0; i<points.length; i++) {
            if(_newPoint.isEqual(points[i])) {
                return false;
            }
        }

        points.push(_newPoint);
        return true;
    };

    /**
     * @param {PointSet} _ps
     */
    this.pushPointSet = function(_ps) {
        const possibleNewPoints = _ps.toArray();
        for(let i=0; i<possibleNewPoints.length; i++) {
            self.push(possibleNewPoints[i]);
        }
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
        }

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
                    pointToVisibleSet[i].push(freePointsArr[j]);
                    pointToVisibleSet[j].push(freePointsArr[i]);
                }
            }
        }
    };

    const getVisiblePointsFrom = function(_currentPoint) {
        for(let i=0; i<freePointsArr.length; i++) {

            if(freePointsArr[i].isEqual(_currentPoint)) {
                const visiblePoints = pointToVisibleSet[i];
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
}

const SvgPathBuilder = {

    /**
     * 
     * @param {Point} _pt 
     * @returns {String}
     */
    pointToLineTo: function(_pt) {
        return "L" + _pt.getX() + " " + _pt.getY();
    },

    /**
     * 
     * @param {Point[]} _points 
     * @returns {String}
     */
    pointsToPath: function(_points) {
        const startPt = _points[0];

        const lineToString = [];
        for(let i=1; i<_points.length; i++) {
            const p = _points[i];
            lineToString.push(SvgPathBuilder.pointToLineTo(p));
        }
        
        const startCoordString = startPt.getX() + " " + startPt.getY();
        const pathString = 'M' + startCoordString + lineToString.join(" ");

        return pathString;
    },

};

/**
 * 
 * @param {Object} _connectorDescriptor
 * @param {PointSet} _routingPointsAroundAnchorSet
 * @param {PointVisibilityMap} _pointVisibilityMap 
 * 
 * @returns {Object}
 */
const computeConnectorPath = function(_connectorDescriptor, _routingPointsAroundAnchorSet, _pointVisibilityMap) {

    const anchorStartStringParts = _connectorDescriptor.anchor_start_centroid.split(' ');
    const anchorEndStringParts = _connectorDescriptor.anchor_end_centroid.split(' ');

    const anchorStartCentroid = new Point(parseFloat(anchorStartStringParts[0]), parseFloat(anchorStartStringParts[1]));
    const anchorEndCentroid = new Point(parseFloat(anchorEndStringParts[0]), parseFloat(anchorEndStringParts[1]));
    const anchorPointMinDist = _routingPointsAroundAnchorSet.findDistanceToPointClosestTo(anchorStartCentroid);

    // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
    // Note that when desired start or end are closed off within a boundary, values will be null
    const adjustedStart = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
        .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

    const adjustedEnd = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorStartCentroid);

    const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
    const routingPointsArray = routingPoints.toArray();

    // Put together all points for path
    const allPointsForPath = [anchorStartCentroid, ...routingPointsArray, anchorEndCentroid];

    return {
        "svgPath": SvgPathBuilder.pointsToPath(allPointsForPath),
        "pointsInPath": allPointsForPath,
    }
};

const convertArrayBufferToFloat64Array = function(_ab) {
    return new Float64Array(_ab);
};

onmessage = function(_msg) {

    const metrics = {};
    metrics.overallTime = null;
    const overallTimeT1 = new Date();

    const gridSize = _msg.data.gridSize;

    const connectorDescriptors = _msg.data.connectorDescriptors;

    const routingPointsSet = new PointSet(convertArrayBufferToFloat64Array(_msg.data.routingPoints));
    const boundaryLinesSet = new LineSet(convertArrayBufferToFloat64Array(_msg.data.boundaryLines));    
    const routingPointsAroundAnchorSet = new PointSet(convertArrayBufferToFloat64Array(_msg.data.routingPointsAroundAnchor));    
    
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );

    connectorDescriptors.forEach(function(_cd) {
        const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap);

        const pointsInPathPointSet = new PointSet(pathData.pointsInPath);

        _cd.svgPath = pathData.svgPath;
        _cd.pointsInPath = pointsInPathPointSet.toFloat64Array().buffer;
    });

    metrics.overallTime = (new Date()) - overallTimeT1;
    metrics.numRoutingPoints = routingPointsSet.count();
    metrics.numBoundaryLines = boundaryLinesSet.count();

    postMessage(
        {
            "connectorDescriptors": connectorDescriptors,
            "metrics": metrics
        }
    );

};

}());
