var GraphPaper = (function (exports) {
'use strict';

/**
 * 
 * @param {Number} _width
 * @param {Number} _height
 */
function Dimensions(_width, _height) {

    /**
     * @returns {Number}
     */       
    this.getWidth = function() {
        return _width;
    };

    /**
     * @returns {Number}
     */       
    this.getHeight = function() {
        return _height;
    };
}

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
 * 
 * @param {Number} _left
 * @param {Number} _top
 * @param {Number} _right
 * @param {Number} _bottom
 */
function Rectangle(_left, _top, _right, _bottom)  {
    
    this.getLeft = function() {
        return _left;
    };

    /**
     * @returns {Number}
     */
    this.getTop = function() {
        return _top;
    };

    /**
     * @returns {Number}
     */
    this.getRight = function() {
        return _right;
    };

    /**
     * @returns {Number}
     */
    this.getBottom = function() {
        return _bottom;
    };

    /**
     * @returns {Point[]}
     */
    this.getPoints = function() {
        return [
            new Point(_left, _top),
            new Point(_right, _top),
            new Point(_right, _bottom),
            new Point(_left, _bottom)
        ];
    };

    /**
     * @returns {Line[]}
     */
    this.getLines = function() {
        return [
            new Line(new Point(_left, _top), new Point(_right, _top)),
            new Line(new Point(_right, _top), new Point(_right, _bottom)),
            new Line(new Point(_right, _bottom), new Point(_left, _bottom)),
            new Line(new Point(_left, _bottom), new Point(_left, _top))
        ];
    };

    /**
     * Scale the bounding box by _gridSize, and return the points comprising the box
     * 
     * @param {Number} _gridSize
     * @returns {Point[]}
     */
    this.getPointsScaledToGrid = function(_gridSize) {

        const centroid = new Point(
            _left + ((_right-_left)*0.5),
            _top + ((_bottom-_top)*0.5)
        );

        const scaleDx = ((_right - centroid.getX()) + _gridSize) / (_right - centroid.getX());
        const scaleDy = ((_bottom - centroid.getY()) + _gridSize) / (_bottom - centroid.getY());        
       
        const scaledPoints = [
            new Point(
                ((_left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_bottom - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_bottom - centroid.getY())*scaleDy) + centroid.getY()
            )
        ];

        return scaledPoints;
    };    

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    this.checkIntersect = function(_otherRectangle) {
        if(_bottom < _otherRectangle.getTop()) {
            return false;
        }

        if(_top > _otherRectangle.getBottom()) {
            return false;
        }

        if(_right < _otherRectangle.getLeft()) {
            return false;
        }

        if(_left > _otherRectangle.getRight()) {
            return false;
        }

        return true;
    };


    /**
     * 
     * @param {Point} _point 
     */
    this.checkIsPointWithin = function(_point) {
        if(_point.getX() >= _left && _point.getX() <= _right && _point.getY() >= _top && _point.getY() <= _bottom) {
            return true;
        }

        return false;
    };

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    this.checkIsWithin = function(_otherRectangle) {
        if( _bottom <= _otherRectangle.getBottom() &&
            _top >= _otherRectangle.getTop() &&
            _right <= _otherRectangle.getRight() &&
            _left >= _otherRectangle.getLeft()
        ) {

            return true;
        }

        return false;
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
        for(let i=0; i<points.length; i++) {
            if(_newPoint.isEqual(points[i])) {
                return false;
            }
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
 * @param {Element} _domElement
 * @param {CanvasObject} _parentObject
 * @param {Canvas} _canvas
 */
function ConnectorAnchor(_domElement, _parentObject, _canvas) {
    
    const self = this;

    /**
     * @returns {String}
     */
    this.getObjectId = function() {
        return _parentObject.getId();
    };

    /**
     * @returns {Number}
     */     
    this.getX = function() {
        return self.getCentroid().getX();
    };

    /**
     * @returns {Number}
     */     
    this.getY = function() {
        return self.getCentroid().getY();
    };

    /**
     * @returns {Number}
     */
    this.getWidth = function() {
        const r = _domElement.getBoundingClientRect();
        return (r.right - r.left);
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        const r = _domElement.getBoundingClientRect();
        return (r.bottom - r.top);
    };

    /**
     * @returns {Point}
     */
    this.getCentroid = function() {
        const viewportRect = _domElement.getBoundingClientRect();
        const pageOffset = _canvas.getPageOffset();        
        return new Point(
            viewportRect.left + pageOffset.getX() + (self.getWidth() * 0.5), 
            viewportRect.top + pageOffset.getY() + (self.getHeight() * 0.5)
        );
    };

    /**
     * 
     * @param {Number} _gridSize 
     * @returns {Point[]}
     */
    this.getRoutingPoints = function(_gridSize) {

        const centroid = self.getCentroid();
        const halfWidth = self.getWidth() * 0.5;
        const halfHeight = self.getHeight() * 0.5;

        return [
            new Point(centroid.getX() + halfWidth + _gridSize, centroid.getY()),
            new Point(centroid.getX() - halfWidth - _gridSize, centroid.getY()),
            new Point(centroid.getX(), centroid.getY() + halfHeight + _gridSize),
            new Point(centroid.getX(), centroid.getY() - halfHeight - _gridSize),
        ];
    };

    /**
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRectange = function() {
        const centroid = self.getCentroid();
        const halfWidth = self.getWidth() * 0.5;
        const halfHeight = self.getHeight() * 0.5;

        return new Rectangle(
            centroid.getX() - halfWidth, 
            centroid.getY() - halfHeight, 
            centroid.getX() + halfWidth, 
            centroid.getY() + halfHeight
        );
    };
}

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 * @param {Element} _containerDomElement
 */
function Connector(_anchorStart, _anchorEnd, _containerDomElement, _strokeColor, _strokeWidth) {
    
    const self = this;

    if(typeof _strokeColor === 'undefined') {
        _strokeColor = '#000';
    }

    if(typeof _strokeWidth === 'undefined') {
        _strokeWidth = '2px';
    }

    /**
     * 
     * @param {Point} _pt 
     * @returns {String}
     */
    const pathElem = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElem.setAttribute("d", 'M0 0 L0 0');
    pathElem.style.stroke = _strokeColor; 
    pathElem.style.strokeWidth = _strokeWidth;         

    /**
     * @type {Element}
     */
    var svgDomElem = null;

    this.appendPathToContainerDomElement = function() {
        svgDomElem = _containerDomElement.appendChild(pathElem);
    };

    /**
     * @param {String} _svgPath
     */
    this.refresh = function(_svgPath) {
        pathElem.setAttribute("d", _svgPath);
    };

    /**
     * @returns {String}
     */
    this.getId = function() {
        const objIds = [_anchorStart.getObjectId(), _anchorEnd.getObjectId()].sort();
        return  objIds.join(':');
    };

    /**
     * @returns {Object}
     */
    this.getDescriptor = function() {
        return {
            "id": self.getId(),
            "anchor_start_centroid": _anchorStart.getCentroid().toString(),
            "anchor_end_centroid": _anchorEnd.getCentroid().toString(),
        };
    };
}

/**
 * 
 * @param {PointSet} _freePoints
 * @param {LineSet} _boundaryLines
 */
function PointVisibilityMap(_freePoints, _boundaryLines) {

    const self = this;

    const boundaryLinesArr = _boundaryLines.toArray();

    /**
     * @type Map<Point,Point[]>
     */
    const pointToVisiblePointSet = new Map();

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

const GRID_STYLE = {
    LINE: 'line',
    DOT: 'dot'
};

/**
 * 
 * @param {Number} _size
 * @param {String} _color
 * @param {String} _style
 */
function Grid(_size, _color, _style) {

    /**
     * @returns {Number}
     */
    this.getSize = function() {
        return _size;
    };

    /**
     * @returns {String}
     */
    this.getStyle = function() {
        return _style;
    };

    /**
     * @returns {String}
     */
    this.getSvgImageTile = function() {
        if(_style === GRID_STYLE.LINE) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + _size + '" height="' + _size + '"><rect width="' + _size + '" height="1" x="0" y="' + (_size-1.0) + '" style="fill:' + _color + '" /><rect width="1" height="' + _size + '" x="' + (_size-1.0) + '" y="0" style="fill:' + _color + '" /></svg>';
        } else {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + _size + '" height="' + _size + '"><rect width="1" height="1" x="' + (_size-1.0) + '" y="' + (_size-1.0) + '" style="fill:' + _color + '" /></svg>';
        }
    };

}

/**
 * @callback HandleCanvasInteractionCallback
 * @param {String} interactionType
 * @param {Object} interactionData
 */ 

 /**
 * @param {Element} _canvasDomElement 
 * @param {Window} _window
 * @param {Worker} _connectorRoutingWorker
 */
function Canvas(_canvasDomElement, _window, _connectorRoutingWorker) {

    const self = this;

    const Event = {
        DBLCLICK: "dblclick",
        CLICK: "click",
        OBJECT_ADDED: "object-added",
        OBJECT_RESIZED: "object-resized",
        OBJECT_TRANSLATED: "object-translated"
    };

    // Create container for SVG connectors
    const svgElem = _window.document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElem.style.width = "100%";
    svgElem.style.height = "100%";
    const connectorsContainerDomElement = _canvasDomElement.appendChild(svgElem);
   
    /**
     * @type {Grid}
     */
    var grid = null;

    var transitionCss = "transform 0.55s ease-in-out, transform-origin 0.55s ease-in-out";

    var transformOriginX = 0;
    var transformOriginY = 0;

    var translateX = 0;
    var translateY = 0;
    var scaleFactor = 1.0;
    var invScaleFactor = 1.0;    

    var pendingTransforms = [];

    var currentPointVisiblityMap = null;

    const canvasObjects = [];
    const objectConnectors = [];

    var objectIdBeingDragged = null;
    var objectIdBeingResized = null;
    
    var objectDragStartX = 0.0;
    var objectDragStartY = 0.0;

    var dblTapDetectVars = {
        lastTouchX: null,
        lastTouchY: null,
        lastTouchTime: null
    };

    const connectorAnchorsSelected = [];

    /**
     * Event name -> Callback map
     */
    const eventHandlers = new Map();


    /**
     * @returns {PointVisibilityMap}
     */
    this.getCurrentPointVisibilityMap = function() {
        return currentPointVisiblityMap;
    };

    /**
     * @param {Grid} _grid
     */
    this.setGrid = function(_grid) {
        grid = _grid;
        _canvasDomElement.style.background = "url('data:image/svg+xml;base64," + _window.btoa(grid.getSvgImageTile()) + "') repeat";
    };

    /**
     * @returns {Grid}
     */
    this.getGrid = function() {
        return grid;
    };

    /**
     * @returns {Number}
     */
    this.getGridSize = function() {
        return grid.getSize();
    };

    /**
     * @returns {PointSet}
     */
    const getConnectorRoutingPoints = function() {
        const pointSet = new PointSet();
        canvasObjects.forEach(function(_obj) {
            const scaledPoints = _obj.getBoundingRectange().getPointsScaledToGrid(self.getGridSize());
            scaledPoints.forEach((_sp) => {
                pointSet.push(_sp);
            });
        });

        canvasObjects.forEach(function(_obj) {
            const objAnchorRoutingPoints = _obj.getConnectorAnchorRoutingPoints(self.getGridSize());
            objAnchorRoutingPoints.forEach(function(_rp) {
                pointSet.push(_rp);
            });
        });

        return pointSet;
    };

    const getConnectorAnchorPoints = function() {
        const pointSet = new PointSet();
        
        canvasObjects.forEach(function(_obj) {
            const objAnchorRoutingPoints = _obj.getConnectorAnchorRoutingPoints(self.getGridSize());
            objAnchorRoutingPoints.forEach(function(_rp) {
                pointSet.push(_rp);
            });
        });

        return pointSet;
    };

    /**
     * @returns {Line[]}
     */    
    const getConnectorBoundaryLines = function() {
        const boundaryLines = [];
        canvasObjects.forEach(function(_obj) {
            const lines = _obj.getBoundingRectange().getLines();
            lines.forEach((_l) => {
                boundaryLines.push(_l);
            });

            const anchors = _obj.getConnectorAnchors();
            anchors.forEach(function(_anchor) {
                const lines = _anchor.getBoundingRectange().getLines();
                lines.forEach((_l) => {
                    boundaryLines.push(_l);
                });                
            });
        });

        return new LineSet(boundaryLines);
    };    

    const refreshAllConnectors = function() {
        const connectorDescriptors = [];
        objectConnectors.forEach(function(_c) {
            connectorDescriptors.push(_c.getDescriptor());
        });

        const anchorPointsFloat64Array = (getConnectorAnchorPoints()).toFloat64Array();
        const routingPointsFloat64Array = (getConnectorRoutingPoints()).toFloat64Array();
        const boundaryLinesFloat64Array = (getConnectorBoundaryLines()).toFloat64Array();
        _connectorRoutingWorker.postMessage(
            {
                "gridSize": self.getGridSize(),
                "connectorDescriptors": connectorDescriptors,
                "routingPoints": routingPointsFloat64Array.buffer,
                "boundaryLines": boundaryLinesFloat64Array.buffer,
                "anchorPoints": anchorPointsFloat64Array.buffer
            },
            [
                routingPointsFloat64Array.buffer,
                boundaryLinesFloat64Array.buffer,
                anchorPointsFloat64Array.buffer
            ]
        );
    };

    _connectorRoutingWorker.onmessage = function(_msg) {
        const connectorDescriptors = _msg.data.connectorDescriptors;
        const getConnectorDescriptorById = function(_id) {
            for(let i=0; i<connectorDescriptors.length; i++) {
                if(connectorDescriptors[i].id === _id) {
                    return connectorDescriptors[i];
                }
            }

            return null;
        };

        objectConnectors.forEach(function(_c) {
            const descriptor = getConnectorDescriptorById(_c.getId());
            if(descriptor) {
                _c.refresh(descriptor.svgPath);
            }
        });
    };

    var makeNewConnector = function(_anchorStart, _anchorEnd, _containerDomElement) {
        return new Connector(_anchorStart, _anchorEnd, _containerDomElement);
    };

    /**
     * @callback ConnectorFactory
     * @param {ConnectorAnchor} _anchorStart
     * @param {ConnectorAnchor} _anchorEnd
     * @param {Element} _containerDomElement
     */

    /**
     * @param {ConnectorFactory} _connectorFactory
     */
    this.setConnectorFactory = function(_newConnectorFactory) {
        makeNewConnector = _newConnectorFactory;
    };    


    /**
     * @returns {String}
     */
    this.getTransitionCss = function() {
        return transitionCss;
    };

    /**
     * 
     * @param {String} _css 
     */
    this.setTransitionCss = function(_css) {
        transitionCss = _css;
        _canvasDomElement.style.transition = transitionCss;
    };

    this.getTransformOriginX = function() {
        return transformOriginX;
    };

    this.getTransformOriginY = function() {
        return transformOriginY;
    };    

    /**
     * @returns {Number}
     */
    this.getScaleFactor = function() {
        return scaleFactor;
    };

    this.getTranslateX = function() {
        return translateX;
    };

    this.getTranslateY = function() {
        return translateY;
    };    

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    this.setTransformOrigin = function(_x, _y) {
        transformOriginX = _x;
        transformOriginY = _y;
        _canvasDomElement.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`;
    };

    /**
     * 
     * @param {Number} _scaleFactor 
     * @param {Boolean} _adjustFactorToPreserveIntegerGrid 
     */
    this.scale = function(_scaleFactor, _adjustFactorToPreserveIntegerGrid) {
        _adjustFactorToPreserveIntegerGrid = _adjustFactorToPreserveIntegerGrid || false;

        if(_adjustFactorToPreserveIntegerGrid) {
            const newGridSize = self.getGridSize() * _scaleFactor;
            const roundedGridSize = Math.round(newGridSize);
            _scaleFactor = roundedGridSize / self.getGridSize();
        }

        scaleFactor = _scaleFactor;
        invScaleFactor = 1.0 / scaleFactor;        

        pendingTransforms.push(`scale3d(${scaleFactor},${scaleFactor},${scaleFactor})`);
        return self;
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    this.translate = function(_x, _y) {
        translateX = _x;
        translateY = _y;
        pendingTransforms.push(`translate3d(${translateX}px,${translateY}px,0)`);
        return self;
    };

    this.applyTransform = function() {
        _canvasDomElement.style.transform = pendingTransforms.join(" ");
        pendingTransforms.length = 0;
    };

    this.resetTransform = function() {
        scaleFactor = 1.0;
        invScaleFactor = 1.0;
        translateX = 0.0;
        translateY = 0.0;
        _canvasDomElement.style.transform = "none";
    };

    /**
     * @returns {Point}
     */
    this.getPageOffset = function() {
        return new Point(window.pageXOffset, window.pageYOffset);
    };

    /**
     * @param {Number} _p 
     * @returns {Number}
     */
    this.snapToGrid = function(_p) {
        var ret = Math.round(_p/self.getGridSize()) * self.getGridSize();
        return Math.max(0, ret - 1);
    };

    /**
     * @returns {Number}
     */
    this.getOffsetLeft = function() {
        return _canvasDomElement.offsetLeft;
    };

    /**
     * @returns {Number}
     */
    this.getOffsetTop = function() {
        return _canvasDomElement.offsetTop;
    };

    /**
     * @returns {Number}
     */
    this.getWidth = function() {
        return _canvasDomElement.offsetWidth;
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        return _canvasDomElement.offsetHeight;
    };    

    /**
     * @param {Number} _x
     * @param {Number} _y
     * @returns {CanvasObject[]}
     */
    this.getObjectsAroundPoint = function(_x, _y) {
        var result = [];

        var ptRect = new Rectangle(_x, _y, _x+1, _y+1);

        canvasObjects.forEach(function(_obj) {
            if(!_obj.getIsDeleted() && ptRect.checkIntersect(_obj.getBoundingRectange())) {
                result.push(_obj);
            }
        });

        return result;
    };
    
    /**
     * @returns {Rectangle}
     */
    this.calcBoundingBox = function() {

        var minTop = null;
        var minLeft = null;
        var maxBottom = null;
        var maxRight = null;

        canvasObjects.forEach(function(element, index, array) {

            var left = parseInt(element.getX());
            var top = parseInt(element.getY());  
            var right = left + parseInt(element.getWidth());
            var bottom = top + parseInt(element.getHeight());  

            if(minLeft === null || left < minLeft) {
                minLeft = left;
            }

            if(minTop === null || top < minTop) {
                minTop = top;
            }

            if(maxBottom === null || bottom > maxBottom) {
                maxBottom = bottom;
            }        

            if(maxRight === null || right > maxRight) {
                maxRight = right;
            }              

        }); 

        return new Rectangle(minLeft, minTop, maxRight, maxBottom);
    };
  
    /**
     * @returns {CanvasObject[]}
     */
    this.getAllObjects = function() {    
        return canvasObjects;
    };

    /**
     * Helper method to publish an object change to all objects
     * 
     * @param {String} _eventName
     * @param {*} _eventData
     */
    this.publishSiblingObjectChange = function(_eventName, _eventData) {
        canvasObjects.forEach(function(_obj) {
            _obj.handleSiblingObjectChange(_eventName, _eventData);
        });
    };

    /**
     * @param {String} _id
     * @returns {CanvasObject|null}
     */   
    this.getObjectById = function(_id) {
        var foundObject = null;
        canvasObjects.forEach(function(obj, index, array) {
            if(foundObject === null && obj.getId() === _id) {
                foundObject = obj;
            }            
        });
        
        return foundObject;
    };

    /**
     * @param {CanvasObject} _obj
     */
    this.addObject = function(_obj) {
        _obj.setResizeStartCallback(handleResizeStart);
        _obj.setMoveStartCallback(handleMoveStart);
        canvasObjects.push(_obj);
        refreshAllConnectors();       

        emitEvent(Event.OBJECT_ADDED, { "object":_obj });
    };

    /**
     * @param {String} _id
     * @returns {Connector|null}
     */    
    this.getConnector = function(_id) {
        for(let c=0; c<objectConnectors.length; c++) {
            if(objectConnectors[c].getId() === _id) {
                return objectConnectors[c];
            }
        }

        return null;
    };

    /**
     * 
     * @param {ConnectorAnchor} _anchorA 
     * @param {ConnectorAnchor} _anchorB 
     */
    this.makeNewConnectorFromAnchors = function(_anchorA, _anchorB) {
        const newConnector = makeNewConnector(_anchorA, _anchorB, connectorsContainerDomElement);
        const foundConnector = self.getConnector(newConnector.getId());

        if(foundConnector === null) {
            objectConnectors.push(newConnector);
            newConnector.appendPathToContainerDomElement();
            refreshAllConnectors();
        }
    };

    /**
     * @param {ConnectorAnchor} _anchor
     */
    this.addConnectionAnchorToSelectionStack = function(_anchor) {
        connectorAnchorsSelected.push(_anchor);

        if(connectorAnchorsSelected.length === 2) {
            self.makeNewConnectorFromAnchors(connectorAnchorsSelected[0], connectorAnchorsSelected[1]);
            connectorAnchorsSelected.length = 0;
        }
    };

    /**
     * @param {Number} _posX 
     * @param {Number} _posY 
     */
    const dblClickTapHandler = function(_posX, _posY) {
        const objectsAroundPoint = self.getObjectsAroundPoint(_posX, _posY);

        const eventData = {
            'targetPoint': new Point(_posX, _posY),
            'objectsAroundPoint': objectsAroundPoint
        };

        emitEvent(Event.DBLCLICK, eventData);
    };

    /**
     * @param {Number} _dblTapSpeed
     * @param {Number} _dblTapRadius
     */
    this.initInteractionHandlers = function(_dblTapSpeed, _dblTapRadius) {

        // dblclick on empty area of canvas
        _canvasDomElement.addEventListener('dblclick', function (e) {
            dblClickTapHandler(e.pageX, e.pageY);
        });

        // click anywhere on canvas
        _canvasDomElement.addEventListener('click', function (e) {
            let canvasObjectClicked = false;
            if(e.target !== _canvasDomElement) {
                canvasObjectClicked = true;
            }

            const eventData = {
                'targetPoint': new Point(e.pageX, e.pageY),
                'canvasObjectClicked': canvasObjectClicked
            };
    
            emitEvent(Event.CLICK, eventData);
        });

        // touchend on canvas, logic to see if there was a double-tap
        _canvasDomElement.addEventListener('touchend', function(e) {
            if(e.changedTouches.length <= 0) {
                return false; // we have nothing to work with
            }

            var dblTapDetected = false;  // flag specifying if we detected a double-tap

            // Position of the touch
            var x = e.changedTouches[0].pageX;
            var y = e.changedTouches[0].pageY;

            var now = new Date().getTime();

            // Check if we have stored data for a previous touch (indicating we should test for a double-tap)
            if(dblTapDetectVars.lastTouchTime !== null) {

                var lastTouchTime = dblTapDetectVars.lastTouchTime;

                // Compute time since the previous touch
                var timeSinceLastTouch = now - lastTouchTime;

                // Get the position of the last touch on the element
                var lastX = dblTapDetectVars.lastTouchX;
                var lastY = dblTapDetectVars.lastTouchY;

                // Compute the distance from the last touch on the element
                var distFromLastTouch = Math.sqrt( Math.pow(x-lastX,2) + Math.pow(y-lastY,2) );

                if(timeSinceLastTouch <= _dblTapSpeed && distFromLastTouch <= _dblTapRadius) {
                    // Flag that we detected a double tap
                    dblTapDetected = true;

                    // Call handler
                    dblClickTapHandler(x, y);

                    // Remove last touch info from element
                    dblTapDetectVars.lastTouchTime = null;
                    dblTapDetectVars.lastTouchX = null;
                    dblTapDetectVars.lastTouchY = null;
                }
            }

            if(!dblTapDetected) {
                dblTapDetectVars.lastTouchTime = now;
                dblTapDetectVars.lastTouchX = x;
                dblTapDetectVars.lastTouchY = y;
            }
        });
    };

    /**
     * 
     * @param {CanvasObject} _obj
     * @param {Number} _x 
     * @param {Number} _y 
     */
    const handleResizeStart = function(_obj, _x, _y) {       
        objectIdBeingResized = _obj.getId();
    };    

    /**
     * 
     * @param {CanvasObject} _obj
     * @param {Number} _x 
     * @param {Number} _y 
     * @param {Boolean} _isTouchMove
     */
    const handleMoveStart = function(_obj, _x, _y, _isTouchMove) {     
        objectIdBeingDragged = _obj.getId();
        objectDragStartX = _x;
        objectDragStartY = _y;        
    };    

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    const handleMove = function(_x, _y) {
        const obj = self.getObjectById(objectIdBeingDragged);
        const mx = self.snapToGrid(_x + obj.getTranslateHandleOffsetX());
        const my = self.snapToGrid(_y + obj.getTranslateHandleOffsetY());
        
        obj.translate(mx, my);
        emitEvent(Event.OBJECT_TRANSLATED, { 'object': obj });      

        // refresh connectors
        refreshAllConnectors();
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    const handleMoveEnd = function(_x, _y) {
        const obj = self.getObjectById(objectIdBeingDragged);
        
        const mx = self.snapToGrid(_x + obj.getTranslateHandleOffsetX());
        const my = self.snapToGrid(_y + obj.getTranslateHandleOffsetY());

        const mxStart = objectDragStartX;
        const myStart = objectDragStartY;

        if(mxStart == mx && myStart == my) {
            // we didn't drag it anywhere
        } else {
            obj.translate(mx, my);
            emitEvent(Event.OBJECT_TRANSLATED, { 'object': obj });            
        }
    };         

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */    
    const handleResize = function(_x, _y) {
        const obj = self.getObjectById(objectIdBeingResized);

        const mx = self.snapToGrid(_x);
        const my = self.snapToGrid(_y);

        const top = obj.getY();
        const left = obj.getX();
        const newWidth = ((mx - left)+1);
        const newHeight = ((my - top)+1);

        obj.resize(newWidth, newHeight);

        // refresh connectors
        refreshAllConnectors();

        emitEvent(Event.OBJECT_RESIZED, { 'object': obj });
    };

    this.initTransformationHandlers = function() {
        
        _canvasDomElement.addEventListener('touchmove', function (e) {
            if (objectIdBeingDragged !== null) {
                handleMove(e.touches[0].pageX * invScaleFactor, e.touches[0].pageY * invScaleFactor);       

                // if we're transforming an object, make sure we don't scroll the canvas
                e.preventDefault();
            }
        });

        _canvasDomElement.addEventListener('mousemove', function (e) {
            if (objectIdBeingDragged !== null) {				
                handleMove(e.pageX * invScaleFactor, e.pageY * invScaleFactor);
            }

            if(objectIdBeingResized !== null) {
                handleResize(e.pageX * invScaleFactor, e.pageY * invScaleFactor);
            }
        });

        _canvasDomElement.addEventListener('touchend', function (e) {
            if(objectIdBeingDragged !== null) {
                const obj = self.getObjectById(objectIdBeingDragged);
                objectIdBeingDragged = null;
                objectIdBeingResized = null;  
            }            
        });

        _canvasDomElement.addEventListener('mouseup', function (e) {
            if (e.which === 1) {
                if(objectIdBeingDragged !== null) {
                    handleMoveEnd(e.pageX * invScaleFactor, e.pageY * invScaleFactor);
                }            

                objectIdBeingDragged = null;
                objectIdBeingResized = null;
            }
        });  

        _canvasDomElement.addEventListener('mousedown', function (e) {
            if(objectIdBeingDragged !== null || objectIdBeingResized !== null) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };

    const emitEvent = function(_eventName, _eventData) {
        const allCallbacks = eventHandlers.get(_eventName) || [];

        for(let i=0; i<allCallbacks.length; i++) {
            const cbFunc = allCallbacks[i];
            cbFunc(_eventData);
        }
    };

    this.off = function(_eventName, _callback) {
        const allCallbacks = eventHandlers.get(_eventName) || [];

        for(let i=0; i<allCallbacks.length; i++) {
            if(allCallbacks[i] === _callback) {
                allCallbacks.splice(i, 1);
                break;
            }
        }

        eventHandlers.set(_eventName, allCallbacks);
    };

    this.on = function(_eventName, _callback) {
        const allCallbacks = eventHandlers.get(_eventName) || [];
        allCallbacks.push(_callback);
        eventHandlers.set(_eventName, allCallbacks);
    };

    self.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));
    self.resetTransform();
    self.setTransformOrigin(0, 0);
    self.setTransitionCss(transitionCss);
}

/**
 * 
 * @param {String} _id
 * @param {Number} _x
 * @param {Number} _y
 * @param {Number} _width
 * @param {Number} _height
 * @param {Canvas} _canvas
 * @param {Element} _domElement
 * @param {Element} _translateHandleDomElement
 * @param {Element} _resizeHandleDomElement
 */
function CanvasObject(_id, _x, _y, _width, _height, _canvas, _domElement, _translateHandleDomElement, _resizeHandleDomElement) {

    const self = this;

    const MOUSE_MIDDLE_BUTTON = 1;

    /**
     * @type {ConnectorAnchor[]}
     */
    const connectorAnchors = [];

    this.x = parseInt(_x);
    this.y = parseInt(_y);
    this.width = parseInt(_width);
    this.height = parseInt(_height);
    this.isDeleted = false;

    /**
     * @param {Element} _connectorAnchorDomElement
     */    
    this.addNonInteractableConnectorAnchor = function(_connectorAnchorDomElement) {
        connectorAnchors.push(new ConnectorAnchor(_connectorAnchorDomElement, self, _canvas));
    };

    /**
     * @param {Element} _connectorAnchorDomElement
     */    
    this.addInteractableConnectorAnchor = function(_connectorAnchorDomElement) {     
        
        const anchor = new ConnectorAnchor(_connectorAnchorDomElement, self, _canvas);

        _connectorAnchorDomElement.addEventListener('click', function(e) {
            _canvas.addConnectionAnchorToSelectionStack(anchor);
        });

        connectorAnchors.push(anchor);
    };

    /**
     * 
     * @param {Number} _gridSize 
     * @returns {Point[]}
     */
    this.getConnectorAnchorRoutingPoints = function(_gridSize) {

        const objBoundingRectange = self.getBoundingRectange();

        const allRoutingPoints = [];
        connectorAnchors.forEach(function(_anchor) {
            const anchorPoints = _anchor.getRoutingPoints(_gridSize);
            anchorPoints.forEach(function(_pt) {
                if(!objBoundingRectange.checkIsPointWithin(_pt)) {
                    allRoutingPoints.push(_pt);
                }
            });
        });

        return allRoutingPoints;
    };

    /**
     * @returns {ConnectorAnchor[]}
     */
    this.getConnectorAnchors = function() {
        return connectorAnchors;
    };

    /**
     * @returns {Number}
     */    
    this.getTranslateHandleOffsetX = function() {
        return -(_translateHandleDomElement.offsetLeft + _translateHandleDomElement.offsetWidth * 0.5);
    };

    /**
     * @returns {Number}
     */    
    this.getTranslateHandleOffsetY = function() {
        return -(_translateHandleDomElement.offsetTop  + _translateHandleDomElement.offsetHeight * 0.5);
    };

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _id;
    };

    /**
     * @returns {Number}
     */
    this.getX = function() {
        return self.x;
    };

    /**
     * @param {Number} _x
     */
    this.setX = function(_x) {
        self.x = _x;
    };

    /**
     * @returns {Number}
     */
    this.getY = function() {
        return self.y;
    };

    /**
     * @param {Number} _y
     */
    this.setY = function(_y) {
        self.y = _y;
    };

    /**
     * @param {Number} _x
     * @param {Number} _y
     */
    this.translate = function(_x, _y) {
        self.x = _x;
        self.y = _y;

        _domElement.style.left = parseInt(self.x) + 'px';
        _domElement.style.top = parseInt(self.y) + 'px';
    };

    /**
     * @returns {Number}
     */
    this.getWidth = function() {
        return self.width;
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        return self.height;
    };

    /**
     * @param {Number} _width
     * @param {Number} _height
     */
    this.resize = function(_width, _height) {
        self.width = _width;
        self.height = _height;

        _domElement.style.width = parseInt(self.width) + 'px';
        _domElement.style.height = parseInt(self.height) + 'px';
    };

    /**
     * @returns {Boolean}
     */
    this.getIsDeleted = function() {
        return self.isDeleted;
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };

    /**
     * 
     * @param {String} _eventName
     * @param {*} _eventData
     */
    this.handleSiblingObjectChange = function(_eventName, _eventData) { 

    };

    /**
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRectange = function() {
        const left = parseInt(self.x);
        const top = parseInt(self.y);
        const right = left + parseInt(self.width);
        const bottom = top + parseInt(self.height);

        return new Rectangle(left, top, right, bottom);
    };

    /**
     * @returns {Point[]}
     */
    this.getBoundingPoints = function() {
        const topLeft = new Point(self.getX(), self.getY());
        const topRight = new Point(self.getX() + self.getWidth(), self.getY());
        const bottomLeft = new Point(self.getX(), self.getY() + self.getWidth());
        const bottomRight = new Point(self.getX() + self.getWidth(), self.getY() + self.getWidth());

        return [
            topLeft,
            topRight,
            bottomLeft,
            bottomRight
        ];
    };


    /**
     * 
     * @param {CanvasObject} _obj 
     * @param {Number} _x 
     * @param {Number} _y 
     * @param {Boolean} _isTouchMove 
     */
    var moveStart = function(_obj, _x, _y, _isTouchMove) {

    };

    /**
     * 
     * @param {CanvasObject} _obj 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    var resizeStart = function(_obj, _x, _y) {

    };

    /**
     * 
     * @param {*} _moveStartFunc 
     */
    this.setMoveStartCallback = function(_moveStartFunc) {
        moveStart = _moveStartFunc;
    }; 

    /**
     * 
     * @param {*} _moveStartFunc 
     */
    this.setResizeStartCallback = function(_resizeStartFunc) {
        resizeStart = _resizeStartFunc;
    }; 
    

    _translateHandleDomElement.addEventListener('touchstart', function(e) {
        moveStart(self, e.touches[0].pageX, e.touches[0].pageY, true);
    });

    _translateHandleDomElement.addEventListener('mousedown', function (e) {
        moveStart(self, e.pageX, e.pageY, false);
    });

    _resizeHandleDomElement.addEventListener('mousedown', function (e) {
        if (e.which !== MOUSE_MIDDLE_BUTTON) {
            return;
        }

        resizeStart(self, e.pageX, e.pageY);
    });    
}

/**
 * 
 * @param {String} _id 
 */
function Cluster(_id) {

    const self = this;

    /**
     * @type {CanvasObjects[]}
     */
    const canvasObjects = [];

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _id;
    };

    /**
     * @param {CanvasObject} _obj
     * @returns {Number|null}
     */
    this.getObjectIndex = function(_obj) {
        return self.getObjectIndexById(_obj.getId());
    };

    /**
     * @param {String} _objId
     * @returns {Number|null}
     */
    this.getObjectIndexById = function(_objId) {
        for(let i=0; i<canvasObjects.length; i++) {
            if(canvasObjects[i].getId() === _objId) {
                return i;
            }
        }

        return null;
    };

    /**
     * @param {CanvasObject} _o
     * @returns {Boolean}
     */
    this.addObject = function(_o) {

        if(self.getObjectIndex(_o) !== null) {
            return false;
        }

        canvasObjects.push(_o);
        return true;
    };

    /**
     * @returns {CanvasObjects[]}
     */
    this.getObjects = function() {
        return canvasObjects;
    };

    /**
     * @returns {String[]}
     */
    this.getObjectIds = function() {
        const ids = [];
        canvasObjects.forEach(function(_o) {
            ids.push(_o.getId());
        });

        return ids;
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeObjectById = function(_id) {
        const idx = self.getObjectIndexById(_id);
        if(idx === null) {
            return false;
        }

        canvasObjects.splice(idx, 1);
        return true;
    };

    this.removeAllObjects = function() {
        canvasObjects.length = 0;
    };
}

function BoxClusterDetector(_boxExtentOffset) {

    const self = this;

    /**
     * 
     * @param {CanvasObject} _obj 
     * @param {CanvasObject[]} _canvasObjectsArray 
     * @returns {Number}
     */
    const getObjectIndexFromArray = function(_obj, _canvasObjectsArray) {
        for(let i=0; i<_canvasObjectsArray.length; i++) {
            if(_canvasObjectsArray[i].getId() === _obj.getId()) {
                return i;
            }
        }

        return -1;
    };

    /**
     * 
     * @param {CanvasObject[]} _objects 
     * @param {CanvasObject[]} _canvasObjectsArray 
     * @returns {CanvasObject[]}
     */
    const removeObjectsFromArray = function(_objects, _canvasObjectsArray) {
        for(let i=0; i<_objects.length; i++) {
            const idx = getObjectIndexFromArray(_objects[i], _canvasObjectsArray);
            if(idx !== -1) {
                _canvasObjectsArray.splice(idx, 1);
            }
        }

        return _canvasObjectsArray;
    };

    /**
     * 
     * @param {Map<Cluster, Number>} _clusterToObjectCountMap 
     * @returns {Cluster}
     */
    const getClusterWithMostObjectsFromClusterMap = function(_clusterToObjectCountMap)
    {
        var curMaxObjs = 0;
        var curClusterWithMax = null;

        _clusterToObjectCountMap.forEach(function(_numObjs, _cluster, _map) {
            if(_numObjs > curMaxObjs) {
                curMaxObjs = _numObjs;
                curClusterWithMax = _cluster;
            }
        });

        return curClusterWithMax;
    };

    /**
     * @param {Map<Cluster, Number>} _clusterToObjectCountMap 
     * @returns {Cluster[]}
     */
    this.areObjectsClose = function(_objA, _objB) {
        const nA = new Rectangle(_objA.x-_boxExtentOffset, _objA.y-_boxExtentOffset, _objA.x + _objA.width + _boxExtentOffset, _objA.y + _objA.height + _boxExtentOffset);
        const nB = new Rectangle(_objB.x-_boxExtentOffset, _objB.y-_boxExtentOffset, _objB.x + _objB.width + _boxExtentOffset, _objB.y + _objB.height + _boxExtentOffset);
        return nA.checkIntersect(nB);
    };
   
    /**
     * @param {CanvasObject} _obj
     * @param {CanvasObject[]} _objectsUnderConsideration
     * @returns {CanvasObject[]}
     */
    this.getAllObjectsCloseTo = function(_obj, _objectsUnderConsideration) {
        const resultSet = [];
        for(let i=0; i<_objectsUnderConsideration.length; i++) {
            if(_obj.getId() === _objectsUnderConsideration[i].getId()) {
                continue;
            }

            if(self.areObjectsClose(_obj, _objectsUnderConsideration[i])) {
                resultSet.push(_objectsUnderConsideration[i]);
            }
        }

        return resultSet;
    };

    /**
     * @param {CanvasObject} _seedObj
     * @param {CanvasObject[]} _objectsUnderConsideration
     * @param {CanvasObject[]} _resultSet
     */
    this.getClusterObjectsFromSeed = function(_seedObj, _objectsUnderConsideration, _resultSet) {
        const closeByObjects = self.getAllObjectsCloseTo(_seedObj, _objectsUnderConsideration);
        if(closeByObjects.length === 0) {
            return [];
        } else {
            removeObjectsFromArray(closeByObjects.concat([_seedObj]), _objectsUnderConsideration);

            closeByObjects.forEach(function(_o) {
                _resultSet.push(_o);
                self.getClusterObjectsFromSeed(_o, _objectsUnderConsideration, _resultSet);
            });
        }
    };


    /**
     * @param {CanvasObject[]} _objs
     * @param {Cluster[]} _clusters
     * @returns {Map<Cluster,Number>}
     */
    this.findIntersectingClustersForObjects = function(_objs, _clusters) {

        // Map of Cluster that is intersecting to number of objects in _objs that is intersecting the given Cluster
        const intersectingClusterToNumObjectsIntersecting = new Map();

        _clusters.forEach(function(_cluster) {

            const clusterObjs = _cluster.getObjects();

            for(let i=0; i<clusterObjs.length; i++) {
                for(let j=0; j<_objs.length; j++) {

                    if(clusterObjs[i].getId() !== _objs[j].getId()) {
                        continue;
                    }

                    if(intersectingClusterToNumObjectsIntersecting.has(_cluster)) {
                        const count = intersectingClusterToNumObjectsIntersecting.get(_cluster);
                        intersectingClusterToNumObjectsIntersecting.set(_cluster, count+1);
                    } else {
                        intersectingClusterToNumObjectsIntersecting.set(_cluster, 1);
                    }
                }
            }
        });

        return intersectingClusterToNumObjectsIntersecting;
    };

    /**
     * @param {CanvasObject} _obj
     * @param {Cluster[]} _clusters
     */
    this.removeObjectFromClusters = function(_obj, _clusters) {
        _clusters.forEach(function(_c) {
            _c.removeObjectById(_obj.getId());
        });
    };    

    this.computeClusters = function(_objects, _knownClusters, _getNewIdFunc) {
        const clusters = _knownClusters.map(function(_c) {
            return _c;
        });

        const objectsUnderConsideration = _objects.map(function(_o) {
            return _o;
        });

        while(objectsUnderConsideration.length > 0) {
            const obj = objectsUnderConsideration.pop();

            const objsForCluster = [obj];
            self.getClusterObjectsFromSeed(obj, objectsUnderConsideration, objsForCluster);

            if(objsForCluster.length > 1) {

                const intersectingClusterToNumObjectsIntersecting = self.findIntersectingClustersForObjects(objsForCluster, clusters);

                if(intersectingClusterToNumObjectsIntersecting.size === 0) {
                    const newCluster = new Cluster(_getNewIdFunc());
                    objsForCluster.forEach(function(_clusterObject) {
                        newCluster.addObject(_clusterObject);
                    });    

                    clusters.push(newCluster);
                } else {
                    const clusterToModify = getClusterWithMostObjectsFromClusterMap(intersectingClusterToNumObjectsIntersecting);

                    // Clear out objects in cluster
                    clusterToModify.removeAllObjects();

                    // Remove object from any cluster it's currently in, add it to clusterToModify
                    objsForCluster.forEach(function(_clusterObject) {
                        self.removeObjectFromClusters(_clusterObject, clusters);                    
                        clusterToModify.addObject(_clusterObject);
                    });

                }

                removeObjectsFromArray(objsForCluster, objectsUnderConsideration);

            } else {
                self.removeObjectFromClusters(obj, clusters);
            }

        }

        // Filter out clusters w/o any objects
        const nonEmptyClusters = clusters.filter(function(_c) {
            if(_c.getObjects().length >= 2) {
                return true;
            }

            return false;
        });

        return nonEmptyClusters;
    };
    
}

exports.Dimensions = Dimensions;
exports.Rectangle = Rectangle;
exports.Point = Point;
exports.LINE_INTERSECTION_TYPE = LINE_INTERSECTION_TYPE;
exports.LineIntersection = LineIntersection;
exports.Line = Line;
exports.CanvasObject = CanvasObject;
exports.Canvas = Canvas;
exports.Cluster = Cluster;
exports.BoxClusterDetector = BoxClusterDetector;
exports.Connector = Connector;
exports.ConnectorAnchor = ConnectorAnchor;
exports.PointVisibilityMap = PointVisibilityMap;
exports.GRID_STYLE = GRID_STYLE;
exports.Grid = Grid;

return exports;

}({}));
