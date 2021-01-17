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
    Point.prototype.getCartesianPoint = function(_sheetWidth, _sheetHeight) {
        return new Point(
            this.__x - (_sheetWidth * 0.5),
            -this.__y + (_sheetHeight * 0.5)
        );
    };

    /**
     * @returns {String}
     */
    Point.prototype.toString = function() {
        return this.__x + " " + this.__y;
    };

    /**
     * @returns {Number[]}
     */
    Point.prototype.toArray = function() {
        return [this.__x, this.__y];
    };

    /**
     * @param {Number[]} _arr
     * @returns {Point}
     */
    Point.fromArray = function(_arr) {
        return new Point(_arr[0], _arr[1]);
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
        this.__type = _type;
        this.__intersectionPoint = _intersectionPoint;
    }

    /**
     * @returns {LINE_INTERSECTION_TYPE}
     */
    LineIntersection.prototype.getType = function() {
        return this.__type;
    };

    /**
     * @returns {Point|null}
     */
    LineIntersection.prototype.getIntersectionPoint = function() {
        return this.__intersectionPoint;
    };

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
     * @returns {Number}
     */
    Line.prototype.getMinX = function() {
        return Math.min(this.getStartPoint().getX(), this.getEndPoint().getX());
    };

    /**
     * @returns {Number}
     */
    Line.prototype.getMaxX = function() {
        return Math.max(this.getStartPoint().getX(), this.getEndPoint().getX());
    };

    /**
     * @returns {Number}
     */
    Line.prototype.getMinY = function() {
        return Math.min(this.getStartPoint().getY(), this.getEndPoint().getY());
    };

    /**
     * @returns {Number}
     */
    Line.prototype.getMaxY = function() {
        return Math.max(this.getStartPoint().getY(), this.getEndPoint().getY());
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
     * Create a Line shorted at the start and end by the specified amounts
     * 
     * @returns {Line}
     */
    Line.prototype.createShortenedLine = function(startReduceByPx, endReduceByPx) {
        const dx = this.__endPoint.getX() - this.__startPoint.getX();
        const dy = this.__endPoint.getY() - this.__startPoint.getY();    
        const dir = this.getDirection();

        return new Line(
            new Point(
                this.__startPoint.getX() + (startReduceByPx * dir.getX()), 
                this.__startPoint.getY() + (startReduceByPx * dir.getY())
            ),
            new Point(
                (this.__startPoint.getX() + dx) - (endReduceByPx * dir.getX()), 
                (this.__startPoint.getY() + dy) - (endReduceByPx * dir.getY())
            )
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
        }    

    }

    /**
     * 
     * @param {Number} _left
     * @param {Number} _top
     * @param {Number} _right
     * @param {Number} _bottom
     */
    function Rectangle(_left, _top, _right, _bottom)  {
        this.__left = _left;
        this.__top = _top;
        this.__right = _right;
        this.__bottom = _bottom;    
    }

    /**
     * @returns {Number}
     */
    Rectangle.prototype.getLeft = function() {
        return this.__left;
    };

    /**
     * @returns {Number}
     */
    Rectangle.prototype.getTop = function() {
        return this.__top;
    };

    /**
     * @returns {Number}
     */
    Rectangle.prototype.getRight = function() {
        return this.__right;
    };

    /**
     * @returns {Number}
     */
    Rectangle.prototype.getBottom = function() {
        return this.__bottom;
    };

    /**
     * @returns {Number}
     */    
    Rectangle.prototype.getWidth = function() {
        return this.__right - this.__left;
    };

    /**
     * @returns {Number}
     */    
    Rectangle.prototype.getHeight = function() {
        return this.__bottom - this.__top;
    };

    /**
     * @returns {Point[]}
     */
    Rectangle.prototype.getPoints = function() {
        return [
            new Point(this.__left, this.__top),
            new Point(this.__right, this.__top),
            new Point(this.__right, this.__bottom),
            new Point(this.__left, this.__bottom)
        ];
    };

    /**
     * @returns {Line[]}
     */
    Rectangle.prototype.getLines = function() {
        return [
            new Line(new Point(this.__left, this.__top), new Point(this.__right, this.__top)),
            new Line(new Point(this.__right, this.__top), new Point(this.__right, this.__bottom)),
            new Line(new Point(this.__right, this.__bottom), new Point(this.__left, this.__bottom)),
            new Line(new Point(this.__left, this.__bottom), new Point(this.__left, this.__top))
        ];
    };

    /**
     * @param {Number} _resizeByPx
     * @returns {Rectangle}
     */
    Rectangle.prototype.getUniformlyResizedCopy = function(_resizeByPx) {
        return new Rectangle(
            this.__left - _resizeByPx, 
            this.__top - _resizeByPx, 
            this.__right + _resizeByPx, 
            this.__bottom + _resizeByPx
        );
    };

    /**
     * Scale the bounding box by _gridSize, and return the points comprising the box
     * 
     * @param {Number} _gridSize
     * @returns {Point[]}
     */
    Rectangle.prototype.getPointsScaledToGrid = function(_gridSize) {

        const centroid = new Point(
            this.__left + ((this.__right-this.__left)*0.5),
            this.__top + ((this.__bottom-this.__top)*0.5)
        );

        const scaleDx = ((this.__right - centroid.getX()) + _gridSize) / (this.__right - centroid.getX());
        const scaleDy = ((this.__bottom - centroid.getY()) + _gridSize) / (this.__bottom - centroid.getY());        
        
        const scaledPoints = [
            new Point(
                ((this.__left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((this.__top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((this.__right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((this.__top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((this.__right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((this.__bottom - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((this.__left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((this.__bottom - centroid.getY())*scaleDy) + centroid.getY()
            )
        ];

        return scaledPoints;
    };    

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    Rectangle.prototype.checkIntersect = function(_otherRectangle) {
        if(this.__bottom < _otherRectangle.getTop()) {
            return false;
        }

        if(this.__top > _otherRectangle.getBottom()) {
            return false;
        }

        if(this.__right < _otherRectangle.getLeft()) {
            return false;
        }

        if(this.__left > _otherRectangle.getRight()) {
            return false;
        }

        return true;
    };


    /**
     * 
     * @param {Point} _point 
     */
    Rectangle.prototype.checkIsPointWithin = function(_point) {
        if(_point.getX() >= this.__left && _point.getX() <= this.__right && _point.getY() >= this.__top && _point.getY() <= this.__bottom) {
            return true;
        }

        return false;
    };

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    Rectangle.prototype.checkIsWithin = function(_otherRectangle) {
        if( this.__bottom <= _otherRectangle.getBottom() &&
            this.__top >= _otherRectangle.getTop() &&
            this.__right <= _otherRectangle.getRight() &&
            this.__left >= _otherRectangle.getLeft()
        ) {

            return true;
        }

        return false;
    };

    const AccessibleRoutingPointsFinder = {

        /**
         * Find routing points that are not occluded by objects
         * 
         * @param {Object[]} _subjectEntityDescriptors
         * @param {Object[]} _occluderEntityDescriptors
         * @param {Number} _gridSize
         * @returns {Object}
         */
        find: function(_subjectEntityDescriptors, _occluderEntityDescriptors, _gridSize) {
            const connectorAnchorToNumValidRoutingPoints = new Map();
            const allRoutingPoints = [];
            const filteredRoutingPoints = new PointSet();

            _subjectEntityDescriptors.forEach((_entityDescriptor) => {
                const anchors = _entityDescriptor.connectorAnchors;

                anchors.forEach((_a) => {

                    // check if anchor is occluded
                    // @todo Commented out for now, need a decision on how to handle anchors where centroid is on the occluder bounding rect
                    /*for(let i=0; i<_occludableByObjects.length; i++) {
                        const possibleOccluderBoundingRect = _occludableByObjects[i].getBoundingRectange();
                        if(possibleOccluderBoundingRect.checkIsPointWithin(_a.getCentroid())) {
                            connectorAnchorToNumValidRoutingPoints.set(_a.getId(), 0);
                            isAnchorOccluded = true;
                            break;
                        }
                    }*/

                    {
                        const routingPoints = (new PointSet(_a.routingPointsFloat64Arr)).toArray();
                        routingPoints.forEach((_rp) => {
                            allRoutingPoints.push(
                                {
                                    "routingPoint": _rp,
                                    "parentAnchorId": _a.id
                                }
                            );
                        });

                        connectorAnchorToNumValidRoutingPoints.set(_a.id, routingPoints.length);
                    }
                });
            });

            allRoutingPoints.forEach((_rp) => {
                let isPointWithinObj = false;

                // check if routing point is occluded
                for(let i=0; i<_occluderEntityDescriptors.length; i++) {
                    const occluder = _occluderEntityDescriptors[i];
                    const boundingRect = new Rectangle(occluder.x, occluder.y, occluder.x + occluder.width, occluder.y + occluder.height);
                    if(boundingRect.checkIsPointWithin(_rp.routingPoint)) {
                        isPointWithinObj = true;
                        const currentNumRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(_rp.parentAnchorId) || 0;
                        connectorAnchorToNumValidRoutingPoints.set(_rp.parentAnchorId, currentNumRoutingPoints - 1);
                    }
                }

                if(!isPointWithinObj) {
                    filteredRoutingPoints.push(_rp.routingPoint);
                }
                
            });

            return {
                "connectorAnchorToNumValidRoutingPoints": connectorAnchorToNumValidRoutingPoints,
                "accessibleRoutingPoints": filteredRoutingPoints,
            };
        }
    };

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
         * @returns {Boolean}
         */
        this.push = function(_newLine) {
            for(let i=0; i<lines.length; i++) {
                if(_newLine.isEqual(lines[i])) {
                    // line already in set
                    return false;
                }
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
        }    
    }

    const PointVisibilityMapRouteOptimizer = {

        /**
         * 
         * @param {Point[]} _pointsInRoute
         * @param {Function} _arePointsVisibleToEachOther
         */
        optimize: function(_pointsInRoute, _arePointsVisibleToEachOther) {
            let start = 0;
            let end = _pointsInRoute.length - 1;

            while(true) {
                if((end-start) <= 1) {
                    start++;
                    end = _pointsInRoute.length - 1;

                    if(start >= _pointsInRoute.length-2) {
                        break;
                    }
                }

                if(_arePointsVisibleToEachOther(_pointsInRoute[start], _pointsInRoute[end])) {
                    _pointsInRoute.splice(start + 1, (end-start) - 1);
                    end = _pointsInRoute.length - 1;
                } else {
                    end--;
                }
            }
        }

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
         * @param {Point} _endPoint 
         * @returns {Object|null}
         */
        const routeToEndpoint = function(_currentRouteLength, _pointsInRoute, _currentPointInfo, _endPoint) {
            const currentPoint = _currentPointInfo.point;
            const visiblePoints = getVisiblePointsRelativeTo(_currentPointInfo);
            let curMinCost = Number.MAX_SAFE_INTEGER;
            let visiblePointWithMinCost = null;

            for(let i=0; i<visiblePoints.length; i++) {
                const visiblePt = visiblePoints[i];

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
                }
            }

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

        const buildEmptyRoutingPointToVisibleSetMap = function(_entityDescriptor, _allSiblingDescriptors, _gridSize) {
            const entityBoundingRect = new Rectangle(_entityDescriptor.x, _entityDescriptor.y, _entityDescriptor.x + _entityDescriptor.width, _entityDescriptor.y + _entityDescriptor.height);
            const foundPoints = AccessibleRoutingPointsFinder.find([_entityDescriptor], _allSiblingDescriptors, _gridSize);
            const routingPoints = foundPoints.accessibleRoutingPoints.toArray();
            const routingPointToVisibleSet = new Map();

            for(let j=0; j<routingPoints.length; j++) {
                routingPointToVisibleSet.set(routingPoints[j], { isValid:false, points:[] });
            }

            // bounding extent routing points
            const scaledPoints = entityBoundingRect.getPointsScaledToGrid(_gridSize);
            scaledPoints.forEach((_sp) => {
                routingPointToVisibleSet.set(_sp, { isValid:false, points:[] });
            }); 

            return routingPointToVisibleSet;
        };

        this.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors = function(_entityDescriptors, _gridSize) {
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
                if(existingDescriptor && !hasEntityMutated(existingDescriptor, _entityDescriptors[i])) ;

                // Entity has been mutated, all routing points for the entity are invalid
                // .. also the inverse relationship (sibling routing points that point to this entity) are also invalid
                const routingPointToVisibleSet = buildEmptyRoutingPointToVisibleSetMap(_entityDescriptors[i], _entityDescriptors, _gridSize);
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

            deletedEntityIds.forEach((_deletedEntity) => {
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
                    }            }
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

            let currentRouteLen = 0;
            const pointsInRoute = [firstPointInfo.point];
            let currentPointInfo = firstPointInfo;
            while(true) {
                const routeSegment = routeToEndpoint(currentRouteLen, pointsInRoute, currentPointInfo, _endPoint);
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
    }

    const SvgPathBuilder = {

        /**
         * 
         * @param {Point} _pt 
         * @returns {String}
         */
        pointToLineTo: function(_pt, _ptIndex) {
            if(_ptIndex === 0) {
                return "M" + _pt.getX() + " " + _pt.getY();
            }

            return "L" + _pt.getX() + " " + _pt.getY();
        },

        /**
         * 
         * @param {Point[]} _points 
         * @param {Number} _curvaturePx 
         * @returns {Point[]}
         */
        pointTripletToTesselatedCurvePoints(_points, _curvaturePx) {
            if(_points.length !== 3) {
                throw new Error("_points must be array of exactly 3 points");
            }

            const controlPoint = _points[1];

            const lineA = new Line(_points[0], _points[1]);
            const lineB = new Line(_points[1], _points[2]);

            const lineAShortened = lineA.createShortenedLine(0, _curvaturePx * 0.5);
            const lineBShortened = lineB.createShortenedLine(_curvaturePx * 0.5, 0);

            return [
                lineAShortened.getStartPoint(),
                lineAShortened.getEndPoint(),
                lineBShortened.getStartPoint(),
                lineBShortened.getEndPoint(),
            ];
        },

        /**
         * 
         * @param {Point[]} _points
         * @param {Number} _curvaturePx
         * @returns {String}
         */
        pointsToPath: function(_points, _curvaturePx) {
            _curvaturePx = _curvaturePx || 0.0;

            const svgPathParts = [];
            let ptIdx = 0; // minify bug if this is put within the if(_curvaturePx... block

            if(_curvaturePx > 0.0) {
                while(_points.length >= 3) {
                    const ptA = _points.shift();
                    const ptB = _points.shift();
                    const ptC = _points.shift();

                    const newPts = SvgPathBuilder.pointTripletToTesselatedCurvePoints(
                        [
                            ptA,
                            ptB,
                            ptC,
                        ],
                        _curvaturePx
                    );                

                    _points.unshift(newPts[3]);
                    _points.unshift(newPts[2]);

                    for(let j=0; j<newPts.length-2; j++) {
                        svgPathParts.push(SvgPathBuilder.pointToLineTo(newPts[j], ptIdx++));
                    }
                }

                while(_points.length > 0) {
                    const pt = _points.shift();
                    svgPathParts.push(SvgPathBuilder.pointToLineTo(pt, ptIdx++));
                }

            } else {
                for(let i=0; i<_points.length; i++) {
                    const p = _points[i];
                    svgPathParts.push(SvgPathBuilder.pointToLineTo(p, i));
                }
            }

            return svgPathParts.join(" ");        
        },

    };

    const ConnectorRoutingAlgorithm = Object.freeze({
        STRAIGHT_LINE: 0,
        STRAIGHT_LINE_BETWEEN_ANCHORS: 1,
        STRAIGHT_LINE_BETWEEN_ANCHORS_AVOID_SELF_INTERSECTION: 2, // unsupported
        ASTAR: 3,
        ASTAR_WITH_ROUTE_OPTIMIZATION: 4
    });

    const workerData = {
        pointVisibilityMap: new PointVisibilityMap(),
        requestQueue: []
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
        const anchorStartCentroid = Point.fromArray(_connectorDescriptor.anchor_start_centroid_arr);
        const anchorEndCentroid = Point.fromArray(_connectorDescriptor.anchor_end_centroid_arr);
        const markerStartSize = _connectorDescriptor.marker_start_size;
        const markerEndSize = _connectorDescriptor.marker_end_size;
        const curvaturePx = _connectorDescriptor.curvature_px;
        const routingAlgorithm = _connectorDescriptor.routing_algorithm;

        const anchorPointMinDist = _routingPointsAroundAnchorSet.findDistanceToPointClosestTo(anchorStartCentroid);

        // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
        // Note that when desired start or end are closed off within a boundary, values will be null
        const adjustedStart = _routingPointsAroundAnchorSet
            .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
            .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

        const adjustedEnd = _routingPointsAroundAnchorSet
            .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
            .findPointClosestTo(anchorStartCentroid);

        let routingPoints = new PointSet();

        if(routingAlgorithm == ConnectorRoutingAlgorithm.STRAIGHT_LINE_BETWEEN_ANCHORS) {
            routingPoints = new PointSet([adjustedStart, adjustedEnd]);
        } else if(routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR || routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION) {
            const optimizeRoute = (routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION) ? true: false;
            routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd, optimizeRoute);
        } else {
            throw "Invalid routing algorithm";
        }

        const routingPointsArray = routingPoints.toArray();
        let pathStartPoint = anchorStartCentroid;
        let pathEndPoint = anchorEndCentroid;

        // Adjust path start point to account for marker
        if(markerStartSize > 0.0 && routingPointsArray.length >= 1) {
            let firstLeg = (new Line(routingPointsArray[0], anchorStartCentroid)).createShortenedLine(0, markerStartSize);
            pathStartPoint = firstLeg.getEndPoint();
        }

        // Adjust path end point to account for marker
        if(markerEndSize > 0.0 && routingPointsArray.length >= 1) {
            let lastLeg = (new Line(routingPointsArray[routingPointsArray.length-1], anchorEndCentroid)).createShortenedLine(0, markerEndSize);
            pathEndPoint = lastLeg.getEndPoint();
        }

        // Put together all points for path
        const allPointsForPath = [pathStartPoint, ...routingPointsArray, pathEndPoint];

        return {
            "svgPath": SvgPathBuilder.pointsToPath(allPointsForPath, curvaturePx),
            "pointsInPath": allPointsForPath,
        }
    };

    /**
     * @param {Object[]} _entityDescriptors
     * @returns {PointSet}
     */    
    const getConnectorRoutingPointsAroundAnchor = function(_entityDescriptors, _gridSize) {
        const routingPointsResult = AccessibleRoutingPointsFinder.find(_entityDescriptors, _entityDescriptors, _gridSize);
        return routingPointsResult.accessibleRoutingPoints;
    };

    const processRequestQueue = function() {
        if(workerData.requestQueue.length === 0) {
            return;
        }

        // grab last request, toss the rest
        const lastRequest = workerData.requestQueue.pop();
        workerData.requestQueue.length = 0;

        // process request
        const metrics = {};
        metrics.overallTime = null;
        const overallTimeT1 = new Date();

        const gridSize = lastRequest.gridSize;
        const connectorDescriptors = lastRequest.connectorDescriptors;
        const entityDescriptors = lastRequest.entityDescriptors;

        const msgDecodeTimeT1 = new Date();

        const routingPointsAroundAnchorSet = getConnectorRoutingPointsAroundAnchor(entityDescriptors, gridSize);

        // end decode
        metrics.msgDecodeTime = (new Date()) - msgDecodeTimeT1;
        
        const pointVisibilityMapCreationTimeT1 = new Date();

        // Update PV map
        workerData.pointVisibilityMap.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors(entityDescriptors, gridSize);

        metrics.pointVisibilityMapCreationTime = (new Date()) - pointVisibilityMapCreationTimeT1;

        const pathComputationTimeT1 = new Date();
        connectorDescriptors.forEach(function(_cd) {
            const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, workerData.pointVisibilityMap);

            const pointsInPathPointSet = new PointSet(pathData.pointsInPath);

            _cd.svgPath = pathData.svgPath;
            _cd.pointsInPath = pointsInPathPointSet.toFloat64Array().buffer;
        });
        metrics.allPathsComputationTime = (new Date()) - pathComputationTimeT1;
        
        metrics.numRoutingPoints = workerData.pointVisibilityMap.getCurrentNumRoutingPoints();
        metrics.numBoundaryLines = workerData.pointVisibilityMap.getCurrentNumBoundaryLines();
        metrics.overallTime = (new Date()) - overallTimeT1;

        postMessage(
            {
                "connectorDescriptors": connectorDescriptors,
                "metrics": metrics
            }
        );

    };

    setInterval(processRequestQueue, 6);

    onmessage = function(_req) {
        workerData.requestQueue.push(_req.data);
    };

}());
