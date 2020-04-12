var GraphPaper = (function (exports) {
    'use strict';

    const MatrixMath = {

        mat4Multiply: function(_a, _b) {

            const result = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            for(let i=0; i<4; i++) {
                for(let j=0; j<4; j++) {

                    var sum = 0;
                    for(let k=0; k<4; k++) {
                        sum += _a[k + 4*i] * _b[j + 4*k];
                    }

                    result[j + 4*i] = sum;
                }
            }

            return result;
        },

        vecMat4Multiply: function(_v, _m) {
            const result = [0, 0, 0, 0];
            for(let vi=0; vi<4; vi++) {
                result[vi] = 
                    (_v[0] * _m[(vi*4) + 0]) + 
                    (_v[1] * _m[(vi*4) + 1]) + 
                    (_v[2] * _m[(vi*4) + 2]) + 
                    (_v[3] * _m[(vi*4) + 3]);
            }

            return result;
        }
    };

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

            if(_curvaturePx > 0.0) {

                let ptIdx = 0;

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
     * @param {Number} _left
     * @param {Number} _top
     * @param {Number} _right
     * @param {Number} _bottom
     */
    function Rectangle(_left, _top, _right, _bottom)  {

        /**
         * @returns {Number}
         */
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
         * @returns {Number}
         */    
        this.getWidth = function() {
            return _right - _left;
        };

        /**
         * @returns {Number}
         */    
        this.getHeight = function() {
            return _bottom - _top;
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
         * @param {Number} _resizeByPx
         * @returns {Rectangle}
         */
        this.getUniformlyResizedCopy = function(_resizeByPx) {
            return new Rectangle(
                _left - _resizeByPx, 
                _top - _resizeByPx, 
                _right + _resizeByPx, 
                _bottom + _resizeByPx
            );
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

    const GroupTransformationContainerEvent = Object.freeze({
        TRANSLATE_START: 'group-transformation-container-translate-start'
    });

    const CanvasEvent = Object.freeze({
        DBLCLICK: "dblclick",
        CLICK: "click",
        CONNECTOR_UPDATED: "connector-updated",
        OBJECT_ADDED: "object-added",
        OBJECT_REMOVED: "object-removed",
        OBJECT_RESIZED: "object-resized",
        OBJECT_TRANSLATED: "object-translated",
        MULTIPLE_OBJECT_SELECTION_STARTED: "multiple-object-selection-started",
        MULTIPLE_OBJECTS_SELECTED: "multiple-objects-selected",
    });

    /**
     * @param {String} _id
     * @param {Element} _domElement
     * @param {Canvas} _canvas
     */
    function ConnectorAnchor(_id, _domElement, _canvas) {
        
        const self = this;

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
            const viewportRelativeRect = _domElement.getBoundingClientRect();
            const pageOffset = _canvas.getPageOffset();        
            return new Point(
                viewportRelativeRect.left + pageOffset.getX() + (self.getWidth() * 0.5), 
                viewportRelativeRect.top + pageOffset.getY() + (self.getHeight() * 0.5)
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

    const ClosestPairFinder = {   
        /**
         * 
         * @param {CanvasObject} _objA 
         * @param {CanvasObject} _objB
         * @param {Map<ConnectorAnchor, Number>} _connectorAnchorToNumValidRoutingPoints
         * @returns {Object}
         */
        findClosestPairBetweenObjects: function(_objA, _objB, _connectorAnchorToNumValidRoutingPoints) {
            const objAConnectorAnchors = _objA.getConnectorAnchors();
            const objBConnectorAnchors = _objB.getConnectorAnchors();

            var startAnchorIdxWithMinDist = 0;
            var endAnchorIdxWithMinDist = 0;
            var minDist = Number.MAX_VALUE;
            
            // Find best anchor element to connect _objA and _objB            
            // Find anchors that produce shortest straight line distance
            for(let x=0; x<objAConnectorAnchors.length; x++) {
                const aCentroid = objAConnectorAnchors[x].getCentroid();
                const objANumValidRoutingPoints = _connectorAnchorToNumValidRoutingPoints.get(objAConnectorAnchors[x].getId()) || 0;
                if(objANumValidRoutingPoints === 0) {
                    continue;
                }

                for(let y=0; y<objBConnectorAnchors.length; y++) {
                    const bCentroid = objBConnectorAnchors[y].getCentroid();
                    const d = Math.sqrt(Math.pow(bCentroid.getX()-aCentroid.getX(),2) + Math.pow(bCentroid.getY()-aCentroid.getY(),2));
                    const objBNumValidRoutingPoints = _connectorAnchorToNumValidRoutingPoints.get(objBConnectorAnchors[y].getId()) || 0;
                    
                    if(d < minDist && objBNumValidRoutingPoints > 0) {
                        startAnchorIdxWithMinDist = x;
                        endAnchorIdxWithMinDist = y;
                        minDist = d;
                    }
                }
            }

            return {
                "objectAAnchorIndex": startAnchorIdxWithMinDist,
                "objectAAnchor": objAConnectorAnchors[startAnchorIdxWithMinDist],
                "objectBAnchorIndex": endAnchorIdxWithMinDist,
                "objectBAnchor": objBConnectorAnchors[endAnchorIdxWithMinDist],
            };
        }
    };

    /**
     * 
     * @param {Number} _dblTapSpeed 
     * @param {Number} _dblTapRadius 
     */
    function DoubleTapDetector(_dblTapSpeed, _dblTapRadius)
    {
        const dblTapDetectVars = {
            lastTouchX: null,
            lastTouchY: null,
            lastTouchTime: null
        };
        
        let dblTapSpeed = _dblTapSpeed || 300.0;
        let dblTapRadius = _dblTapRadius || 24.0;

        /**
         * 
         * @param {TouchEvent} _touchEndEvent 
         * @param {Array} currentInvTransformationMatrix
         * @returns {Object}
         */
        this.processTap = function(_touchEndEvent, _currentInvTransformationMatrix) {
            if(_touchEndEvent.changedTouches.length === 0) {
                // we have nothing to work with
                return {
                    "doubleTapDetected": false,
                    "touchX": null,
                    "touchY": null
                };
            }

            // Position of the touch
            const invTransformedPos = MatrixMath.vecMat4Multiply(
                [_touchEndEvent.changedTouches[0].pageX, _touchEndEvent.changedTouches[0].pageY, 0, 1],
                _currentInvTransformationMatrix
            );            

            let dblTapDetected = false;  // flag specifying if we detected a double-tap
            const x = invTransformedPos[0];
            const y = invTransformedPos[1];
            const now = new Date().getTime();

            // Check if we have stored data for a previous touch (indicating we should test for a double-tap)
            if(dblTapDetectVars.lastTouchTime !== null) {
                const lastTouchTime = dblTapDetectVars.lastTouchTime;

                // Compute time since the previous touch
                const timeSinceLastTouch = now - lastTouchTime;

                // Get the position of the last touch on the element
                const lastX = dblTapDetectVars.lastTouchX;
                const lastY = dblTapDetectVars.lastTouchY;

                // Compute the distance from the last touch on the element
                const distFromLastTouch = Math.sqrt( Math.pow(x-lastX,2) + Math.pow(y-lastY,2) );

                if(timeSinceLastTouch <= dblTapSpeed && distFromLastTouch <= dblTapRadius) {
                    // Remove last touch info from element
                    dblTapDetectVars.lastTouchTime = null;
                    dblTapDetectVars.lastTouchX = null;
                    dblTapDetectVars.lastTouchY = null;

                    // Flag that we detected a double tap
                    dblTapDetected = true;                
                }
            }

            if(!dblTapDetected) {
                dblTapDetectVars.lastTouchTime = now;
                dblTapDetectVars.lastTouchX = x;
                dblTapDetectVars.lastTouchY = y;
            }

            return {
                "doubleTapDetected": dblTapDetected,
                "touchX": x,
                "touchY": y
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
        }    
    }

    const ConnectorEvent = Object.freeze({
        CLICK: 'connector-click',
        MOUSE_ENTER: 'connector-mouse-enter',
        MOUSE_LEAVE: 'connector-mouse-leave'
    });

    /**
     * 
     * @param {ConnectorAnchor} _anchorStart 
     * @param {ConnectorAnchor} _anchorEnd
     * @param {Element} _containerDomElement
     * @param {String} _strokeColor
     * @param {String} _strokeWidth
     * @param {Number} _curvaturePx
     */
    function Connector(_anchorStart, _anchorEnd, _containerDomElement, _strokeColor, _strokeWidth, _curvaturePx) {
        
        const self = this;

        const eventNameToHandlerFunc = new Map();
        let markerStartSize = 0;
        let markerEndSize = 0;

        if(typeof _strokeColor === 'undefined') {
            _strokeColor = '#000';
        }

        if(typeof _strokeWidth === 'undefined') {
            _strokeWidth = '2px';
        }

        if(typeof _curvaturePx === 'undefined') {
            _curvaturePx = 0;
        }

        /**
         * @type {Point[]|null}
         */
        let pathPoints = null;

        /**
         * @type {Element}
         */
        const pathElem = window.document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElem.setAttribute("d", 'M0 0 L0 0');
        pathElem.style.stroke = _strokeColor; 
        pathElem.style.strokeWidth = _strokeWidth;         

        pathElem.addEventListener("click", function(e) {
            self.dispatchEvent(ConnectorEvent.CLICK, {"connector":self, "clickedAtX": e.pageX, "clickedAtY": e.pageY});
        });

        pathElem.addEventListener("mouseenter", function(e) {
            self.dispatchEvent(ConnectorEvent.MOUSE_ENTER, {"connector":self, "pointerAtX": e.pageX, "pointerAtY": e.pageY});
        });

        pathElem.addEventListener("mouseleave", function(e) {
            self.dispatchEvent(ConnectorEvent.MOUSE_LEAVE, {"connector":self });
        });        

        /**
         * @type {Element}
         */
        var svgDomElem = null;

        this.appendPathToContainerDomElement = function() {
            svgDomElem = _containerDomElement.appendChild(pathElem);
        };

        /**
         * @param {String} _url
         * @param {Number} _size
         */    
        this.setMarkerStart = function(_url, _size) {
            pathElem.setAttribute(`marker-start`, `url(${_url})`);
            markerStartSize = _size;
        };

        this.unsetMarkerStart = function() {
            pathElem.removeAttribute(`marker-start`);
            markerStartSize = 0;
        };

        /**
         * @param {String} _url
         * @param {Number} _size
         */
        this.setMarkerEnd = function(_url, _size) {
            pathElem.setAttribute(`marker-end`, `url(${_url})`);
            markerEndSize = _size;
        };

        this.unsetMarkerEnd = function() {
            pathElem.removeAttribute(`marker-end`);
            markerEndSize = 0;
        };    

        /**
         * @returns {Point[]|null}
         */
        this.getPathPoints = function() {
            return pathPoints;
        };

        /**
         * @returns {Line[]}
         */
        this.getPathLines = function() {
            if(pathPoints === null || pathPoints.length < 2) {
                return [];
            }

            const lines = [];
            for(let i=0; i<pathPoints.length-1; i++) {
                lines.push(new Line(pathPoints[i], pathPoints[i+1]));
            }

            return lines;
        };

        /**
         * @returns {Number}
         */
        this.getLength = function() {
            let totalLength = 0;

            const pathLines = self.getPathLines();
            for(let i=0; i<pathLines.length; i++) {
                totalLength += pathLines[i].getLength();
            }
            
            return totalLength;
        };

        /**
         * @returns {Point}
         */
        this.getMidpoint = function() {
            const totalLength = self.getLength();
            const pathLines = self.getPathLines();

            let lengthSoFar = 0;
            let curPathLineWithMidpoint = null;

            for(let i=0; i<pathLines.length; i++) {
                curPathLineWithMidpoint = pathLines[i];
                const pathLineLength = pathLines[i].getLength();
                lengthSoFar += pathLineLength;

                if(lengthSoFar >= totalLength/2.0) {
                    break;
                }
            }

            const lengthBeforeCur = (lengthSoFar - curPathLineWithMidpoint.getLength());
            const midOnCurPath = (totalLength / 2.0) - lengthBeforeCur; // i.e. distance to midpoint

            const p = midOnCurPath / curPathLineWithMidpoint.getLength();

            return new Point(
                curPathLineWithMidpoint.getStartPoint().getX() + (p * (curPathLineWithMidpoint.getEndPoint().getX() - curPathLineWithMidpoint.getStartPoint().getX())),
                curPathLineWithMidpoint.getStartPoint().getY() + (p * (curPathLineWithMidpoint.getEndPoint().getY() - curPathLineWithMidpoint.getStartPoint().getY()))
            );
        };

        /**
         * @returns {Point}
         */
        this.getMidpointDirection = function() {
            const totalLength = self.getLength();
            const pathLines = self.getPathLines();

            let lengthSoFar = 0;
            let curPathLineWithMidpoint = null;

            for(let i=0; i<pathLines.length; i++) {
                curPathLineWithMidpoint = pathLines[i];
                const pathLineLength = pathLines[i].getLength();
                lengthSoFar += pathLineLength;

                if(lengthSoFar >= totalLength/2.0) {
                    break;
                }
            }

            if(curPathLineWithMidpoint === null) {
                return pathLines[0].getDirection();
            }

            return curPathLineWithMidpoint.getDirection();
        };


        /**
         * @param {String} _svgPath
         * @param {Point[]} _pathPoints
         */
        this.refresh = function(_svgPath, _pathPoints) {
            pathPoints = _pathPoints;
            pathElem.setAttribute("d", _svgPath);
        };

        /**
         * @returns {String}
         */
        this.getId = function() {
            const anchorIds = [_anchorStart.getId(), _anchorEnd.getId()].sort();
            return anchorIds.join(':');
        };

        /**
         * @returns {ConnectorAnchor}
         */
        this.getAnchorStart = function() {
            return _anchorStart;
        };

        /**
         * @returns {ConnectorAnchor}
         */    
        this.getAnchorEnd = function() {
            return _anchorEnd;
        };

        this.removePathElement = function() {
            pathElem.remove();
        };

        /**
         * @param {String} _cl
         * @returns {undefined}
         */
        this.addClassToDomElement = function(_cl) {
            pathElem.classList.add(_cl);
        };

        /**
         * @param {String} _cl
         * @returns {undefined}
         */    
        this.removeClassFromDomElement = function(_cl) {
            pathElem.classList.remove(_cl);
        };

        /**
         * @returns {Object}
         */
        this.getDescriptor = function() {
            return {
                "id": self.getId(),
                "anchor_start_centroid_arr": _anchorStart.getCentroid().toArray(),
                "anchor_end_centroid_arr": _anchorEnd.getCentroid().toArray(),
                "marker_start_size": markerStartSize,
                "marker_end_size": markerEndSize,
                "curvature_px": _curvaturePx
            };
        };

        /**
         * 
         * @param {String} _eventName 
         * @param {*} _handlerFunc 
         */
        this.on = function(_eventName, _handlerFunc) {
            const allHandlers = eventNameToHandlerFunc.get(_eventName) || [];
            allHandlers.push(_handlerFunc);
            eventNameToHandlerFunc.set(_eventName, allHandlers);        
        };

        /**
         * 
         * @param {String} _eventName 
         * @param {*} _callback 
         */
        this.off = function(_eventName, _callback) {
            const allCallbacks = eventNameToHandlerFunc.get(_eventName) || [];

            for(let i=0; i<allCallbacks.length; i++) {
                if(allCallbacks[i] === _callback) {
                    allCallbacks.splice(i, 1);
                    break;
                }
            }

            eventNameToHandlerFunc.set(_eventName, allCallbacks);
        };

        /**
         * @param {String} _eventId
         * @param {Object} _eventData
         */
        this.dispatchEvent = function(_eventId, _eventData) {
            const observers = eventNameToHandlerFunc.get(_eventId) || [];
            observers.forEach(function(handler) {
                handler(_eventData);
            });
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

    const ConnectorRoutingWorkerJsString = `(function () {
  'use strict';

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function Point(a,b){this.__x=a,this.__y=b;}Point.prototype.getX=function(){return this.__x},Point.prototype.getY=function(){return this.__y},Point.prototype.isEqual=function(a){return !(this.__x!==a.getX()||this.__y!==a.getY())},Point.prototype.getCartesianPoint=function(a,b){return new Point(this.__x-.5*a,-this.__y+.5*b)},Point.prototype.toString=function(){return this.__x+" "+this.__y},Point.prototype.toArray=function(){return [this.__x,this.__y]},Point.fromArray=function(a){return new Point(a[0],a[1])};

  var LINE_INTERSECTION_TYPE=Object.freeze({PARALLEL:"parallel",COINCIDENT:"coincident",LINE:"line",LINESEG:"lineseg"});function LineIntersection(a,b){this.getType=function(){return a},this.getIntersectionPoint=function(){return b};}

  function Line(a,b){if("undefined"==typeof a||null===a)throw "Line missing _startPoint";if("undefined"==typeof b||null===b)throw "Line missing _endPoint";this.__startPoint=a,this.__endPoint=b;}Line.prototype.getStartPoint=function(){return this.__startPoint},Line.prototype.getEndPoint=function(){return this.__endPoint},Line.prototype.isEqual=function(a){return !!(this.getStartPoint().isEqual(a.getStartPoint())&&this.getEndPoint().isEqual(a.getEndPoint()))},Line.prototype.getLength=function(){return Math.sqrt(Math.pow(this.__endPoint.getX()-this.__startPoint.getX(),2)+Math.pow(this.__endPoint.getY()-this.__startPoint.getY(),2))},Line.prototype.getDirection=function(){var a=this.__endPoint.getX()-this.__startPoint.getX(),b=this.__endPoint.getY()-this.__startPoint.getY(),c=Math.sqrt(a*a+b*b);return new Point(a/c,b/c)},Line.prototype.createShortenedLine=function(a,b){var c=this.__endPoint.getX()-this.__startPoint.getX(),d=this.__endPoint.getY()-this.__startPoint.getY(),e=this.getDirection();return new Line(new Point(this.__startPoint.getX()+a*e.getX(),this.__startPoint.getY()+a*e.getY()),new Point(this.__startPoint.getX()+c-b*e.getX(),this.__startPoint.getY()+d-b*e.getY()))},Line.prototype.computeIntersectionType=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?LINE_INTERSECTION_TYPE.COINCIDENT:LINE_INTERSECTION_TYPE.PARALLEL;var m=k/j,n=l/j;return 1<m||0>m||1<n||0>n?LINE_INTERSECTION_TYPE.LINE:LINE_INTERSECTION_TYPE.LINESEG},Line.prototype.computeIntersection=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT,null):new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL,null);var m=k/j,n=l/j,o=this.__startPoint.getX()+m*(this.__endPoint.getX()-this.__startPoint.getX()),p=this.__startPoint.getY()+m*(this.__endPoint.getY()-this.__startPoint.getY());return 1<m||0>m||1<n||0>n?new LineIntersection(LINE_INTERSECTION_TYPE.LINE,new Point(o,p)):new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG,new Point(o,p))};

  function PointSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.pushPointSet=function(a){for(var c=a.toArray(),d=0;d<c.length;d++)b.push(c[d]);},this.findPointClosestTo=function(a){var b=null,d=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<d&&(b=c,d=e.getLength());}),b},this.findDistanceToPointClosestTo=function(a){var b=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var d=new Line(a,c);d.getLength()<b&&(b=d.getLength());}),b},this.findPointsCloseTo=function(a,b){var d=new PointSet;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<=b&&d.push(c);}),d},this.toArray=function(){return c},this.toFloat64Array=function(){for(var a=new Float64Array(2*c.length),b=0;b<c.length;b++)a[0+2*b]=c[b].getX(),a[1+2*b]=c[b].getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=2)c.push(new Point(a[b],a[b+1]));};this.count=function(){return c.length},a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function LineSet(a){var b=this,c=[];this.push=function(a){var b=!1;return (c.forEach(function(c){a.isEqual(c)&&(b=!0);}),!b)&&(c.push(a),!0)},this.toArray=function(){return c},this.count=function(){return c.length},this.toFloat64Array=function(){for(var a=new Float64Array(4*c.length),b=0;b<c.length;b++)a[0+4*b]=c[b].getStartPoint().getX(),a[1+4*b]=c[b].getStartPoint().getY(),a[2+4*b]=c[b].getEndPoint().getX(),a[3+4*b]=c[b].getEndPoint().getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=4)c.push(new Line(new Point(a[b],a[b+1]),new Point(a[b+2],a[b+3])));};a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function PointVisibilityMap(a,b){var c=this,d=b.toArray(),e=a.toArray(),f=Array(a.count()),g=function doesLineIntersectAnyBoundaryLines(a){for(var c,e=0;e<d.length;e++)if(c=d[e].computeIntersectionType(a),c===LINE_INTERSECTION_TYPE.LINESEG)return !0;return !1},h=function computePointsVisibility(){for(var a=0;a<e.length;a++)f[a]=[];for(var b=0;b<e.length;b++)for(var c,d=b+1;d<e.length;d++)c=new Line(e[b],e[d]),g(c)||(f[b].push(d),f[d].push(b));},i=function getVisiblePointsFrom(a){for(var c=0;c<e.length;c++)if(e[c].isEqual(a)){var b=function(){var a=f[c],b=[];return a.forEach(function(a){b.push(e[a]);}),{v:b}}();if("object"==typeof b)return b.v}return []},j=function routeToEndpoint(a,b,c,d){var e=i(c),f=Number.MAX_SAFE_INTEGER,g=null;return e.forEach(function(e){for(var k=0;k<b.length;k++)if(e.isEqual(b[k]))return;var h=new Line(c,e).getLength()+a,j=new Line(e,d).getLength();h+j<f&&(f=h+j,g=e);}),f===Number.MAX_SAFE_INTEGER?null:{cost:f,point:g}},k=function optimizeRoute(a){for(var b=0;!(b+2>=a.length);){var c=new Line(a[b],a[b+2]);g(c)?b++:a.splice(b+1,1);}};this.getPointToVisibleSetData=function(){return f},this.findPointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return e.forEach(function(d){var e=new Line(a,d);e.getLength()<c&&(b=d,c=e.getLength());}),b},this.findVisiblePointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return e.forEach(function(d){var e=new Line(a,d),f=e.getLength();f<c&&!g(e)&&(b=d,c=f);}),b},this.computeRoute=function(a,b){if(null===a||null===b)return new PointSet;var d=c.findVisiblePointClosestTo(a);if(null===d)return new PointSet;for(var e,f=0,h=[d],i=d;!0;){if(e=j(f,h,i,b),null===e){var l=new Line(h[h.length-1],b);if(g(l))return new PointSet;break}if(f+=new Line(i,e.point).getLength(),h.push(e.point),i=e.point,1>new Line(i,b).getLength())break}return k(h),new PointSet(h)},h();}

  var SvgPathBuilder={pointToLineTo:function pointToLineTo(a,b){return 0===b?"M"+a.getX()+" "+a.getY():"L"+a.getX()+" "+a.getY()},pointTripletToTesselatedCurvePoints:function pointTripletToTesselatedCurvePoints(a,b){if(3!==a.length)throw new Error("_points must be array of exactly 3 points");var c=a[1],d=new Line(a[0],a[1]),e=new Line(a[1],a[2]),f=d.createShortenedLine(0,.5*b),g=e.createShortenedLine(.5*b,0);return [f.getStartPoint(),f.getEndPoint(),g.getStartPoint(),g.getEndPoint()]},pointsToPath:function pointsToPath(a,b){b=b||0;var c=[];if(0<b){for(var h=0;3<=a.length;){var d=a.shift(),e=a.shift(),f=a.shift(),g=SvgPathBuilder.pointTripletToTesselatedCurvePoints([d,e,f],b);a.unshift(g[3]),a.unshift(g[2]);for(var k=0;k<g.length-2;k++)c.push(SvgPathBuilder.pointToLineTo(g[k],h++));}for(;0<a.length;){var j=a.shift();c.push(SvgPathBuilder.pointToLineTo(j,ptIdx++));}}else for(var l,m=0;m<a.length;m++)l=a[m],c.push(SvgPathBuilder.pointToLineTo(l,m));return c.join(" ")}};

  var computeConnectorPath=function computeConnectorPath(a,b,c){var d=Point.fromArray(a.anchor_start_centroid_arr),e=Point.fromArray(a.anchor_end_centroid_arr),f=a.marker_start_size,g=a.marker_end_size,h=a.curvature_px,i=b.findDistanceToPointClosestTo(d),j=b.findPointsCloseTo(d,i).findPointClosestTo(e),k=b.findPointsCloseTo(e,i).findPointClosestTo(d),l=c.computeRoute(j,k),m=l.toArray(),n=d,o=e;if(0<f&&1<=m.length){var q=new Line(m[0],d).createShortenedLine(0,f);n=q.getEndPoint();}if(0<g&&1<=m.length){var r=new Line(m[m.length-1],e).createShortenedLine(0,g);o=r.getEndPoint();}var p=[n].concat(_toConsumableArray(m),[o]);return {svgPath:SvgPathBuilder.pointsToPath(p,h),pointsInPath:p}},convertArrayBufferToFloat64Array=function convertArrayBufferToFloat64Array(a){return new Float64Array(a)},requestQueue=[],processRequestQueue=function processRequestQueue(){if(0!==requestQueue.length){var a=requestQueue.pop();requestQueue.length=0;var b={overallTime:null},c=new Date,d=a.gridSize,e=a.connectorDescriptors,f=new Date,g=new PointSet(convertArrayBufferToFloat64Array(a.routingPoints)),h=new LineSet(convertArrayBufferToFloat64Array(a.boundaryLines)),i=new PointSet(convertArrayBufferToFloat64Array(a.routingPointsAroundAnchor));b.msgDecodeTime=new Date-f;var j=new Date,k=new PointVisibilityMap(g,h);b.pointVisibilityMapCreationTime=new Date-j,e.forEach(function(a){var b=computeConnectorPath(a,i,k),c=new PointSet(b.pointsInPath);a.svgPath=b.svgPath,a.pointsInPath=c.toFloat64Array().buffer;}),b.numRoutingPoints=g.count(),b.numBoundaryLines=h.count(),b.overallTime=new Date-c,postMessage({pointVisibilityMapData:k.getPointToVisibleSetData(),connectorDescriptors:e,metrics:b});}};setInterval(processRequestQueue,6),onmessage=function onmessage(a){requestQueue.push(a.data);};

}());
`;

    /**
     * @callback HandleCanvasInteractionCallback
     * @param {String} interactionType
     * @param {Object} interactionData
     */ 

     /**
     * @param {Element} _canvasDomElement 
     * @param {Window} _window
     */
    function Canvas(_canvasDomElement, _window) {

        const self = this;

        // Create container for SVG connectors
        const svgElem = _window.document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElem.style.width = "100%";
        svgElem.style.height = "100%";
        const connectorsContainerDomElement = _canvasDomElement.appendChild(svgElem);

        // Selection box element
        var selectionBoxElem = null;

        // GroupTransformationContainers
        const groupTransformationContainers = [];
        var currentGroupTransformationContainerBeingDragged = null;
      
        /**
         * @type {Grid}
         */
        var grid = null;

        var transitionCss = "transform 0.55s ease-in-out, transform-origin 0.55s ease-in-out";

        var transformOriginX = 0;
        var transformOriginY = 0;

        var touchMoveLastX = 0.0;
        var touchMoveLastY = 0.0;

        var translateX = 0;
        var translateY = 0;
        var scaleFactor = 1.0;
        var invScaleFactor = 1.0;    

        const invTransformationMatrixStack = [];
        var currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var currentTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        var currentPointVisiblityMap = null;

        var connectorRefreshBufferTime = 6.94;
        const canvasObjects = [];

        /**
         * @type {Connector[]}
         */
        const objectConnectors = [];

        var objectIdBeingDragged = null;
        var objectIdBeingResized = null;
        
        var objectDragX = 0.0;
        var objectDragY = 0.0;
        var objectDragStartX = 0.0;
        var objectDragStartY = 0.0;

        var doubleTapDetector = null;

        var debugPanelElem  = null;
        var isShowingDebugPanel = false;

        const metrics = {
            connectorRoutingWorker: {
                executionTime: null,
                numRoutingPoints: null,
                numBoundaryLines: null,
                msgDecodeTime: null,
                pointVisibilityMapCreationTime: null
            },
            refreshAllConnectorsInternal: {
                executionTime: null
            },
            connectorsRefreshTime: null
        };

        var touchHoldDelayTimeMs = 750.0;
        var touchHoldStartInterval = null;

        var multiObjectSelectionStartX = 0.0;
        var multiObjectSelectionStartY = 0.0;
        var multiObjectSelectionEndX = 0.0;
        var multiObjectSelectionEndY = 0.0;
        var multiObjectSelectionStarted = false;

        const connectorAnchorsSelected = [];

        /**
         * Event name -> Callback map
         */
        const eventHandlers = new Map();

        /**
         * ConnectorAnchor -> Number map
         */
        const connectorAnchorToNumValidRoutingPoints = new Map();

        var connectorRefreshStartTime = null;
        var connectorRefreshTimeout = null;

        // Setup ConnectorRoutingWorker
        const workerUrl = URL.createObjectURL(new Blob([ ConnectorRoutingWorkerJsString ]));
        
        /*const connectorCompleteComputeWorker = new Worker(workerUrl);
        connectorCompleteComputeWorker.onmessage = function(_msg) {

        };*/

        const connectorRoutingWorker = new Worker(workerUrl);
        connectorRoutingWorker.onmessage = function(_msg) {
            const connectorsRefreshTimeT1 = new Date();

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
                    const ps = new PointSet(new Float64Array(descriptor.pointsInPath));
                    _c.refresh(descriptor.svgPath, ps.toArray());
                    emitEvent(CanvasEvent.CONNECTOR_UPDATED, { 'connector': _c });
                }
            });        

            metrics.connectorsRefreshTime = (new Date()) - connectorsRefreshTimeT1;

            metrics.connectorRoutingWorker.executionTime = _msg.data.metrics.overallTime;
            metrics.connectorRoutingWorker.numBoundaryLines = _msg.data.metrics.numBoundaryLines;
            metrics.connectorRoutingWorker.numRoutingPoints = _msg.data.metrics.numRoutingPoints;
            metrics.connectorRoutingWorker.msgDecodeTime = _msg.data.metrics.msgDecodeTime;
            metrics.connectorRoutingWorker.pointVisibilityMapCreationTime = _msg.data.metrics.pointVisibilityMapCreationTime;

            refreshDebugMetricsPanel();
        };    

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
            _canvasDomElement.style.backgroundImage = "url('data:image/svg+xml;base64," + _window.btoa(grid.getSvgImageTile()) + "')";
            _canvasDomElement.style.backgroundRepeat = "repeat";
            _canvasDomElement.style.backgroundColor = "#fff";
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
         * 
         * @param {CanvasObject[]} _objs 
         * @returns {Point[]}
         */
        const getAccessibleRoutingPointsFromObjectAnchors = function(_objs) {

            connectorAnchorToNumValidRoutingPoints.clear();

            const allRoutingPoints = [];
            const filteredRoutingPoints = [];

            _objs.forEach((_o) => {
                const anchors = _o.getConnectorAnchors();

                anchors.forEach((_a) => {
                    const routingPoints = _a.getRoutingPoints(self.getGridSize());
                    routingPoints.forEach((_rp) => {
                        allRoutingPoints.push(
                            {
                                "routingPoint": _rp,
                                "parentAnchor": _a
                            }
                        );
                    });      

                    connectorAnchorToNumValidRoutingPoints.set(_a.getId(), routingPoints.length);
                });

            });


            allRoutingPoints.forEach((_rp) => {

                let isPointWithinObj = false;

                for(let i=0; i<_objs.length; i++) {
                    const obj = _objs[i];
                    const boundingRect = obj.getBoundingRectange();
                    if(boundingRect.checkIsPointWithin(_rp.routingPoint)) {
                        isPointWithinObj = true;

                        const currentNumRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(_rp.parentAnchor.getId()) || 0;
                        connectorAnchorToNumValidRoutingPoints.set(_rp.parentAnchor.getId(), currentNumRoutingPoints - 1);
                    }
                }

                if(!isPointWithinObj) {
                    filteredRoutingPoints.push(_rp.routingPoint);
                }
                
            });

            return filteredRoutingPoints;
        };

        /**
         * @returns {PointSet}
         */
        const getObjectExtentRoutingPoints = function() {
            const pointSet = new PointSet();
            canvasObjects.forEach(function(_obj) {
                const scaledPoints = _obj.getBoundingRectange().getPointsScaledToGrid(self.getGridSize());
                scaledPoints.forEach((_sp) => {
                    pointSet.push(_sp);
                });
            });

            return pointSet;
        };

        /**
         * @returns {PointSet}
         */    
        const getConnectorRoutingPointsAroundAnchor = function() {
            const pointSet = new PointSet();
            
            const routingPoints = getAccessibleRoutingPointsFromObjectAnchors(canvasObjects);
            routingPoints.forEach((_rp) => {
                pointSet.push(_rp);
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

        const refreshAllConnectorsInternal = function() {
            const executionTimeT1 = new Date();
            const connectorDescriptors = [];
            objectConnectors.forEach(function(_c) {
                connectorDescriptors.push(_c.getDescriptor());
            });

            const routingPointsAroundAnchor = getConnectorRoutingPointsAroundAnchor();
            const objectExtentRoutingPoints = getObjectExtentRoutingPoints();

            const allRoutingPoints = new PointSet();        
            allRoutingPoints.pushPointSet(routingPointsAroundAnchor);
            allRoutingPoints.pushPointSet(objectExtentRoutingPoints);

            const routingPointsAroundAnchorFloat64Array = routingPointsAroundAnchor.toFloat64Array();
            const routingPointsFloat64Array = allRoutingPoints.toFloat64Array();
            const boundaryLinesFloat64Array = (getConnectorBoundaryLines()).toFloat64Array();
            connectorRoutingWorker.postMessage(
                {
                    "gridSize": self.getGridSize(),
                    "connectorDescriptors": connectorDescriptors,
                    "routingPoints": routingPointsFloat64Array.buffer,
                    "boundaryLines": boundaryLinesFloat64Array.buffer,
                    "routingPointsAroundAnchor": routingPointsAroundAnchorFloat64Array.buffer
                },
                [
                    routingPointsFloat64Array.buffer,
                    boundaryLinesFloat64Array.buffer,
                    routingPointsAroundAnchorFloat64Array.buffer
                ]
            );

            metrics.refreshAllConnectorsInternal.executionTime = (new Date()) - executionTimeT1;
        };

        /**
         * @param {Number} _bufferTimeMs
         */
        this.setConnectorRefreshBufferTime = function(_bufferTimeMs) {
            connectorRefreshBufferTime = _bufferTimeMs;
        };

        this.refreshAllConnectors = function() {
            // We'll try to coalesce refresh calls within refreshBatchBufferTimeMs 
            // Default is 6.944ms, for continuous calls, this corresponds to 144Hz, but actual
            // performance is less given web worker overhead, path computation cost, and browser minimum limit on setTimeout

            if(connectorRefreshStartTime !== null) {
                const tdelta = (new Date()) - connectorRefreshStartTime;
                if(tdelta < connectorRefreshBufferTime) {
                    return; // already scheduled
                }
            }

            connectorRefreshStartTime = new Date();        
            connectorRefreshTimeout = setTimeout(function() {
                connectorRefreshTimeout = null;
                connectorRefreshStartTime = null;
                refreshAllConnectorsInternal();
            }, connectorRefreshBufferTime);
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

        /**
         * @returns {Number}
         */    
        this.getTransformOriginX = function() {
            return transformOriginX;
        };

        /**
         * @returns {Number}
         */    
        this.getTransformOriginY = function() {
            return transformOriginY;
        };    

        /**
         * @returns {Number}
         */
        this.getScaleFactor = function() {
            return scaleFactor;
        };

        /**
         * @returns {Number}
         */
        this.getTranslateX = function() {
            return translateX;
        };

        /**
         * @returns {Number}
         */    
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

            const scaleMat = 
                [
                    scaleFactor, 0, 0, 0, 
                    0, scaleFactor, 0, 0, 
                    0, 0, scaleFactor, 1, 
                    0, 0, 0, 1
                ];

            currentTransformationMatrix = MatrixMath.mat4Multiply(
                currentTransformationMatrix, 
                scaleMat
            );

            invTransformationMatrixStack.push(
                [
                    invScaleFactor, 0, 0, 0, 
                    0, invScaleFactor, 0, 0, 
                    0, 0, invScaleFactor, 1, 
                    0, 0, 0, 1
                ]
            );

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

            const translateMatrix =             
                [
                    1, 0, 0, 0, 
                    0, 1, 0, 0, 
                    0, 0, 1, 0, 
                    translateX, translateY, 0, 1
                ];

            currentTransformationMatrix = MatrixMath.mat4Multiply(
                currentTransformationMatrix, 
                translateMatrix
            ); 

            invTransformationMatrixStack.push(
                [
                    1, 0, 0, -translateX, 
                    0, 1, 0, -translateY, 
                    0, 0, 1, 0, 
                    0, 0, 0, 1
                ]
            );

            return self;
        };

        this.applyTransform = function() {
            _canvasDomElement.style.transform = self.getTranformMatrixCss();
            currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            for(let i=0; i<invTransformationMatrixStack.length; i++) {
                currentInvTransformationMatrix = MatrixMath.mat4Multiply(currentInvTransformationMatrix, invTransformationMatrixStack[i]);
            }
        };

        /**
         * @returns {Array}
         */
        this.getTransformMatrix = function() {
            return currentTransformationMatrix;
        };

        /**
         * @returns {String}
         */    
        this.getTranformMatrixCss = function() {
            const matElems = currentTransformationMatrix.join(",");
            return `matrix3d(${matElems})`;
        };

        this.resetTransform = function() {
            scaleFactor = 1.0;
            invScaleFactor = 1.0;
            translateX = 0.0;
            translateY = 0.0;
            currentTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            invTransformationMatrixStack.length = 0;
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
         * @param {Object[]} _objs 
         * @returns {Rectangle}
         */
        this.calcBoundingRectForObjects = function(_objs) {
            var minTop = null;
            var minLeft = null;
            var maxBottom = null;
            var maxRight = null;

            _objs.forEach(function(_obj, index, array) {
                const objRect = _obj.getBoundingRectange();
                const left = objRect.getLeft();
                const top = objRect.getTop();  
                const right = objRect.getRight();
                const bottom = objRect.getBottom();

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

            if(minTop === null || minLeft === null || maxBottom === null || maxRight === null) {
                minTop = 0;
                minLeft = 0;
                maxBottom = 0;
                maxRight = 0;            
            }

            return new Rectangle(minLeft, minTop, maxRight, maxBottom);
        };

        /**
         * @returns {Rectangle}
         */
        this.calcBoundingBox = function() {
            if(canvasObjects.length === 0) {    
                return new Rectangle(0, 0, self.getWidth(), self.getHeight());     
            }

            return self.calcBoundingRectForObjects(canvasObjects);
        };

        /**
         * @param {Number} _x
         * @param {Number} _y
         * @param {Number} _radius
         * @returns {CanvasObject[]}
         */
        this.getObjectsAroundPoint = function(_x, _y, _radius) {

            _radius = _radius || 1.0;

            const result = [];

            const ptRect = new Rectangle(
                _x - _radius, 
                _y - _radius, 
                _x + _radius, 
                _y + _radius
            );

            canvasObjects.forEach(function(_obj) {
                if(ptRect.checkIntersect(_obj.getBoundingRectange())) {
                    result.push(_obj);
                }
            });

            return result;
        };

        /**
         * @param {Rectangle} _rect
         * @returns {CanvasObject[]}
         */
        this.getObjectsWithinRect = function(_rect) {
            const result = [];

            canvasObjects.forEach(function(_obj) {
                if(_obj.getBoundingRectange().checkIsWithin(_rect)) {
                    result.push(_obj);
                }
            });

            return result;
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
            _obj.on('obj-resize-start', handleResizeStart);
            _obj.on('obj-resize', function(e) {
                emitEvent(CanvasEvent.OBJECT_RESIZED, { 'object': e.obj });
                self.refreshAllConnectors();    
            });

            _obj.on('obj-translate-start', handleMoveStart);
            _obj.on('obj-translate', function(e) {
                emitEvent(CanvasEvent.OBJECT_TRANSLATED, { 'object': e.obj });
                self.refreshAllConnectors();    
            });

            canvasObjects.push(_obj);
            self.refreshAllConnectors();       

            emitEvent(CanvasEvent.OBJECT_ADDED, { "object":_obj });
        };

        /**
         * Remove object from the canvas
         * Note: as caller is responsible for putting object into the DOM, caller is responsible for removing it from the DOM
         * 
         * @param {String} _objId
         * @returns {Boolean} 
         */
        this.removeObject = function(_objId) {
            for(let i=0; i<canvasObjects.length; i++) {
                if(canvasObjects[i].getId() === _objId) {
                    canvasObjects.splice(i, 1);
                    self.refreshAllConnectors();
                    emitEvent(CanvasEvent.OBJECT_REMOVED, { "object":canvasObjects[i] });
                    return true;
                }
            }

            return false;
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
         * @returns {Connector[]}
         */
        this.getAllConnectors = function() {
            return objectConnectors;
        };

        /**
         * 
         * @param {CanvasObject} _objA 
         * @param {CanvasObject} _objB 
         * @returns {Connector[]}
         */
        this.getConnectorsBetweenObjects = function(_objA, _objB) {

            const foundConnectors = [];

            objectConnectors.forEach((_conn) => {
                const aS = _conn.getAnchorStart();
                const aE = _conn.getAnchorEnd();

                if(_objA.hasConnectorAnchor(aS) && _objB.hasConnectorAnchor(aE)) {
                    foundConnectors.push(_conn);
                }

                if(_objA.hasConnectorAnchor(aE) && _objB.hasConnectorAnchor(aS)) {
                    foundConnectors.push(_conn);
                }            
            });

            return foundConnectors;
        };

        /**
         * 
         * @param {String} _connectorId
         * @returns {Array} 
         */
        this.getObjectsConnectedViaConnector = function(_connectorId) {
            const foundObjects = [];

            const allObjs = self.getAllObjects();

            objectConnectors.forEach((_conn) => {

                if(_conn.getId() !== _connectorId) {
                    return;
                }

                const aS = _conn.getAnchorStart();
                const aE = _conn.getAnchorEnd();

                allObjs.forEach((_o) => {
                    if(_o.hasConnectorAnchor(aS) || _o.hasConnectorAnchor(aE)) {
                        foundObjects.push(_o);
                    }
                });

            });

            return foundObjects;        
        };

        /**
         * 
         * @param {CanvasObject} _obj
         * @returns {Connector[]} 
         */
        this.getConnectorsConnectedToObject = function(_obj) {
            const foundConnectors = [];

            objectConnectors.forEach((_conn) => {
                const aS = _conn.getAnchorStart();
                const aE = _conn.getAnchorEnd();

                if(_obj.hasConnectorAnchor(aS) || _obj.hasConnectorAnchor(aE)) {
                    foundConnectors.push(_conn);
                }

            });

            return foundConnectors;        
        };

        /**
         * @param {String} _connectorAnchorId
         * @returns {Object|null} 
         */
        this.getObjectWithConnectorAnchor = function(_connectorAnchorId) {
            const allObjects = self.getAllObjects();
            for(let i=0; i<allObjects.length; i++) {                
                const anchors = allObjects[i].getConnectorAnchors();
                for(let j=0; j<anchors.length; j++) {
                    if(anchors[j].getId() === _connectorAnchorId) {
                        return allObjects[i];
                    }
                }
            }

            return null;
        };    

        this.removeAllConnectors = function() {
            objectConnectors.forEach(function(_conn) {
                _conn.removePathElement();
            });

            objectConnectors.splice(0, objectConnectors.length);
        };

        /**
         * 
         * @param {Connector} _connector
         * @returns {Boolean}
         */
        this.removeConnector = function(_connector) {
            for(let i=0; i<objectConnectors.length; i++) {
                if(objectConnectors[i] === _connector) {
                    _connector.removePathElement();
                    objectConnectors.splice(i, 1);
                    return true;
                }
            }

            return false;
        };

        /**
         * 
         * @param {ConnectorAnchor} _anchorA 
         * @param {ConnectorAnchor} _anchorB 
         * @returns {Connector}
         */
        this.makeNewConnectorFromAnchors = function(_anchorA, _anchorB) {
            const newConnector = makeNewConnector(_anchorA, _anchorB, connectorsContainerDomElement);
            const foundConnector = self.getConnector(newConnector.getId());

            if(foundConnector === null) {
                objectConnectors.push(newConnector);
                newConnector.appendPathToContainerDomElement();
                self.refreshAllConnectors();
                return newConnector;
            }

            return foundConnector;
        };

        /**
         * 
         * @param {Object} _objA 
         * @param {Object} _objB
         * @returns {Object} 
         */
        this.findBestConnectorAnchorsToConnectObjects = function(_objA, _objB, _onFound) {
            const searchFunc = (_searchData) => {
                // !!! Note that a Canvas.getAccessibleRoutingPointsFromObjectAnchors() call must precede in order for connectorAnchorToNumValidRoutingPoints map to be populated and up-to-date
                getAccessibleRoutingPointsFromObjectAnchors([_objA, _objB]);

                const result = ClosestPairFinder.findClosestPairBetweenObjects(_searchData.objectA, _searchData.objectB, connectorAnchorToNumValidRoutingPoints);
        
                _searchData.cb(result);
            };

            setTimeout(function() {
                searchFunc(
                    {
                        "objectA": _objA,
                        "objectB": _objB,
                        "cb": _onFound
                    }
                );
            }, connectorRefreshBufferTime);
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

            emitEvent(CanvasEvent.DBLCLICK, eventData);
        };

        const refreshDebugMetricsPanel = function() {
            if(!isShowingDebugPanel) {
                return;
            }

            debugPanelElem.innerHTML = `
            <p>refreshAllConnectorsInternal.executionTime = ${metrics.refreshAllConnectorsInternal.executionTime}</p>
            <p>connectorRoutingWorker.executionTime = ${metrics.connectorRoutingWorker.executionTime}</p>            
            <p>-- connectorRoutingWorker.msgDecodeTime = ${metrics.connectorRoutingWorker.msgDecodeTime}</p>
            <p>-- connectorRoutingWorker.pointVisibilityMapCreationTime = ${metrics.connectorRoutingWorker.pointVisibilityMapCreationTime}</p>
            <p>-- connectorRoutingWorker.numRoutingPoints = ${metrics.connectorRoutingWorker.numRoutingPoints}</p>
            <p>-- connectorRoutingWorker.numBoundaryLines = ${metrics.connectorRoutingWorker.numBoundaryLines}</p>
            <p>connectorsRefreshTime = ${metrics.connectorsRefreshTime}</p>
        `;
        };

        this.initDebugMetricsPanel = function() {
            debugPanelElem = _window.document.createElement("div");
            debugPanelElem.classList.add("graphpaper-debug-panel");
            debugPanelElem.style.display = "block";
            debugPanelElem.style.position = "fixed";
            debugPanelElem.style.right = "0px";
            debugPanelElem.style.top = "0px";
            debugPanelElem.style.width = "450px";
            debugPanelElem.style.height = "200px";
            debugPanelElem.style.color = "#fff";
            debugPanelElem.style.padding = "15px";
            debugPanelElem.style.backgroundColor = "rgba(0,0,0,0.75)";
            document.body.appendChild(debugPanelElem);

            isShowingDebugPanel = true;
        };

        /**
         * @param {Number} _dblTapSpeed
         * @param {Number} _dblTapRadius
         */
        this.initInteractionHandlers = function(_dblTapSpeed, _dblTapRadius) {

            doubleTapDetector = new DoubleTapDetector(_dblTapSpeed, _dblTapRadius);

            // dblclick on empty area of canvas
            _canvasDomElement.addEventListener('dblclick', function (e) {

                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.pageX, e.pageY, 0, 1],
                    currentInvTransformationMatrix
                );

                dblClickTapHandler(invTransformedPos[0], invTransformedPos[1]);
            });

            // click anywhere on canvas
            _canvasDomElement.addEventListener('click', function (e) {
                let canvasObjectClicked = false;
                if(e.target !== _canvasDomElement) {
                    canvasObjectClicked = true;
                }

                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.pageX, e.pageY, 0, 1],
                    currentInvTransformationMatrix
                );

                const eventData = {
                    'targetPoint': new Point(invTransformedPos[0], invTransformedPos[1]),
                    'canvasObjectClicked': canvasObjectClicked
                };
        
                emitEvent(CanvasEvent.CLICK, eventData);
            });

            // touchend on canvas, logic to see if there was a double-tap
            _canvasDomElement.addEventListener('touchend', function(e) {
                const detectResult = doubleTapDetector.processTap(
                    e,
                    currentInvTransformationMatrix,
                );

                if(detectResult.doubleTapDetected) {
                    dblClickTapHandler(detectResult.touchX, detectResult.touchY);
                }

                console.log(detectResult);

            });
        };

        /**
         * @param {GroupTransformationContainer} _groupTransformationContainer
         */
        this.attachGroupTransformationContainer = function(_groupTransformationContainer) {
            _canvasDomElement.appendChild(_groupTransformationContainer.getContainerDomElement());
            groupTransformationContainers.push(_groupTransformationContainer);

            _groupTransformationContainer.on(GroupTransformationContainerEvent.TRANSLATE_START, function(e) {
                currentGroupTransformationContainerBeingDragged = e.container;
            });
        };

        /**
         * @param {GroupTransformationContainer} _groupTransformationContainer
         * @returns {Boolean}
         */
        this.detachGroupTransformationContainer = function(_groupTransformationContainer) {
            for(let i=0; i<groupTransformationContainers.length; i++) {
                if(groupTransformationContainers[i] === _groupTransformationContainer) {
                    _canvasDomElement.removeChild(_groupTransformationContainer.getContainerDomElement());
                    groupTransformationContainers.splice(i, 1);
                    return true;
                }
            }

            return false;
        };

        /**
         * 
         * @param {Number} _dx 
         * @param {Number} _dy 
         */
        const handleGroupTransformationContainerMove = function(_dx, _dy) {
            const gtc = currentGroupTransformationContainerBeingDragged;        
            gtc.translateByOffset(_dx, _dy);
        };

        /**
         * 
         * @param {Object} _e 
         */
        const handleResizeStart = function(_e) {       
            objectIdBeingResized = _e.obj.getId();
        };    

        /**
         * 
         * @param {Object} _e
         */
        const handleMoveStart = function(_e) {     
            objectIdBeingDragged = _e.obj.getId();
            objectDragX = _e.x;
            objectDragY = _e.y;
            objectDragStartX = _e.x;
            objectDragStartY = _e.y;        
        };    

        /**
         * 
         * @param {Number} _x 
         * @param {Number} _y 
         */
        const handleMove = function(_x, _y) {
            const obj = self.getObjectById(objectIdBeingDragged);
            const translateOffset = obj.getTranslateHandleOffset();
            const mx = self.snapToGrid(_x + translateOffset.getX());
            const my = self.snapToGrid(_y + translateOffset.getY());
            
            objectDragX = mx;
            objectDragY = my;		

            obj.translate(mx, my);
        };

        /**
         * 
         * @param {Number} _x 
         * @param {Number} _y 
         */
        const handleMoveEnd = function(_x, _y) {
            const obj = self.getObjectById(objectIdBeingDragged);
            const translateOffset = obj.getTranslateHandleOffset();
            const mx = self.snapToGrid(_x + translateOffset.getX());
            const my = self.snapToGrid(_y + translateOffset.getY());
            obj.translate(mx, my);       
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
        };

        /**
         * 
         * @param {Number} _x 
         * @param {Number} _y 
         * @param {Element} _targetElem 
         * @returns {Boolean}
         */
        const handleMultiObjectSelectionStart = function(_x, _y, _targetElem) {
            if(multiObjectSelectionStarted) {
                return false; // already doing selection
            }

            if(_targetElem !== svgElem) { // hacky, but b/c of the SVG overlay, events propagate from the overlay
                return false;
            }

            if(objectIdBeingDragged !== null) {
                return false;
            }

            if(objectIdBeingResized !== null) {
                return false;
            }        

            multiObjectSelectionStartX = _x;
            multiObjectSelectionStartY = _y;
            multiObjectSelectionEndX = _x;
            multiObjectSelectionEndY = _y;
            multiObjectSelectionStarted = true;

            selectionBoxElem.style.left = `${multiObjectSelectionStartX}px`;
            selectionBoxElem.style.top = `${multiObjectSelectionStartY}px`;
            selectionBoxElem.style.width = `0px`;
            selectionBoxElem.style.height = `0px`;
            selectionBoxElem.style.display = "block";

            emitEvent(
                CanvasEvent.MULTIPLE_OBJECT_SELECTION_STARTED,
                { 
                    'x': _x,
                    'y': _y
                }
            );

            return true;
        };

        const handleMultiObjectSelectionEnd = function() {
            multiObjectSelectionStarted = false;

            const selectionRect = new Rectangle(
                Math.min(multiObjectSelectionStartX, multiObjectSelectionEndX), 
                Math.min(multiObjectSelectionStartY, multiObjectSelectionEndY),
                Math.max(multiObjectSelectionStartX, multiObjectSelectionEndX), 
                Math.max(multiObjectSelectionStartY, multiObjectSelectionEndY)
            );

            const selectedObjects = self.getObjectsWithinRect(selectionRect);
            const boundingRect = self.calcBoundingRectForObjects(selectedObjects);

            selectionBoxElem.style.left = `${boundingRect.getLeft()}px`;
            selectionBoxElem.style.top = `${boundingRect.getTop()}px`;
            selectionBoxElem.style.width = `${boundingRect.getWidth()}px`;
            selectionBoxElem.style.height = `${boundingRect.getHeight()}px`;
            selectionBoxElem.style.display = "none";

            emitEvent(
                CanvasEvent.MULTIPLE_OBJECTS_SELECTED, 
                { 
                    'selectedObjects': selectedObjects,
                    'boundingRect': boundingRect
                }
            );
        };

        /**
         * 
         * @param {Number} _endX 
         * @param {Number} _endY 
         */
        const updateSelectionBoxEndPoint = function(_endX, _endY) {
            multiObjectSelectionEndX = _endX;
            multiObjectSelectionEndY = _endY;
            const width = multiObjectSelectionEndX - multiObjectSelectionStartX;
            const height = multiObjectSelectionEndY - multiObjectSelectionStartY;

            if(width >= 0) {
                selectionBoxElem.style.width = `${width}px`;
            } else {
                selectionBoxElem.style.left = `${_endX}px`;
                selectionBoxElem.style.width = `${Math.abs(width)}px`;
            }

            if(height >= 0) {
                selectionBoxElem.style.height = `${height}px`;
            } else {
                selectionBoxElem.style.top = `${_endY}px`;
                selectionBoxElem.style.height = `${Math.abs(height)}px`;
            }
        };

        /**
         * @param {String[]} _selectionRectStyleCssClasses
         */
        this.initMultiObjectSelectionHandler = function(_selectionRectStyleCssClasses) {
            // Create selection box DOM element
            const selBox = _window.document.createElement("div");
            selBox.classList.add("ia-selection-box");
            selBox.style.display = "none";
            selBox.style.position = "absolute";
            selBox.style.left = "0px";
            selBox.style.top = "0px";

            if(typeof _selectionRectStyleCssClasses === 'undefined' || _selectionRectStyleCssClasses.length === 0) {
                selBox.style.border = "1px solid rgb(158, 158, 158)";
                selBox.style.background = "rgba(153, 153, 153, 0.5)";            
            } else {
                // CSS classes will control styling for things GraphPaper doesn't care about
                // (GraphPaper style concerns are handled via inline styles which will always take precedance)
                _selectionRectStyleCssClasses.forEach(function(_class) {
                    selBox.classList.add(_class);
                });
            }

            selectionBoxElem = _canvasDomElement.appendChild(selBox);

            const handleTouchSelectionStart = function(e) {
                const hasSelectionStarted = handleMultiObjectSelectionStart(e.touches[0].pageX, e.touches[0].pageY, e.target);
            };

            _canvasDomElement.addEventListener('mousedown', function(e) {
                if (e.which !== 1) {
                    return;
                }

                const hasSelectionStarted = handleMultiObjectSelectionStart(e.pageX, e.pageY, e.target);
                if(hasSelectionStarted) {
                    e.preventDefault(); // prevents text selection from triggering
                }
            });

            _canvasDomElement.addEventListener('touchstart', function(e) {
                touchHoldStartInterval = setInterval(function() {
                    handleTouchSelectionStart(e);
                }, touchHoldDelayTimeMs);
            });

            _canvasDomElement.addEventListener('touchend', function(e) {
                clearInterval(touchHoldStartInterval);
            });

            _canvasDomElement.addEventListener('touchmove', function(e) {
                clearInterval(touchHoldStartInterval);
            });        
        };

        this.initTransformationHandlers = function() {
            _canvasDomElement.addEventListener('touchstart', function(e) {
                touchMoveLastX = e.touches[0].pageX;
                touchMoveLastY = e.touches[0].pageY;
            });

            _canvasDomElement.addEventListener('touchmove', function (e) {
                if (objectIdBeingDragged !== null) {
                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.touches[0].pageX, e.touches[0].pageY, 0, 1],
                        currentInvTransformationMatrix
                    );                    

                    handleMove(invTransformedPos[0], invTransformedPos[1]);
                    // if we're transforming an object, make sure we don't scroll the canvas
                    e.preventDefault();
                }

                if(objectIdBeingResized !== null) {
                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.touches[0].pageX, e.touches[0].pageY, 0, 1],
                        currentInvTransformationMatrix
                    );     

                    handleResize(invTransformedPos[0], invTransformedPos[1]);
                    e.preventDefault();
                }

                if(currentGroupTransformationContainerBeingDragged !== null) {
                    const dx = e.touches[0].pageX - touchMoveLastX;
                    const dy = e.touches[0].pageY - touchMoveLastY;

                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [dx, dy, 0, 1],
                        currentInvTransformationMatrix
                    );                    

                    handleGroupTransformationContainerMove(invTransformedPos[0], invTransformedPos[1]);        
                    e.preventDefault();        
                }

                if(multiObjectSelectionStarted) {
                    updateSelectionBoxEndPoint(e.touches[0].pageX, e.e.touches[0].pageY);
                    e.preventDefault();
                }

                touchMoveLastX = e.touches[0].pageX;
                touchMoveLastY = e.touches[0].pageY;
            });

            _canvasDomElement.addEventListener('mousemove', function (e) {
                if (objectIdBeingDragged !== null) {		
                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.pageX, e.pageY, 0, 1],
                        currentInvTransformationMatrix
                    );                    

                    handleMove(invTransformedPos[0], invTransformedPos[1]);
                }

                if(objectIdBeingResized !== null) {
                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.pageX, e.pageY, 0, 1],
                        currentInvTransformationMatrix
                    );     

                    handleResize(invTransformedPos[0], invTransformedPos[1]);
                }

                if(currentGroupTransformationContainerBeingDragged !== null) {
                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.movementX, e.movementY, 0, 1],
                        currentInvTransformationMatrix
                    );                    

                    handleGroupTransformationContainerMove(invTransformedPos[0], invTransformedPos[1]);                
                }

                if(multiObjectSelectionStarted) {
                    updateSelectionBoxEndPoint(e.pageX, e.pageY);
                }
            });

            _canvasDomElement.addEventListener('touchend', function (e) {

                // e.touches is empty..
                // Need to use e.changedTouches for final x,y ???

                if(objectIdBeingDragged !== null) {
                    objectIdBeingDragged = null;
                }           
                
                if(objectIdBeingResized !== null) {
                    objectIdBeingResized = null;  
                }

                if(currentGroupTransformationContainerBeingDragged !== null) {
                    currentGroupTransformationContainerBeingDragged.endTranslate();
                    currentGroupTransformationContainerBeingDragged = null;
                }            

                if(multiObjectSelectionStarted) {
                    handleMultiObjectSelectionEnd();
                }
            });

            _canvasDomElement.addEventListener('mouseup', function (e) {
                if (e.which === 1) {
                    if(objectIdBeingDragged !== null) {

                        const invTransformedPos = MatrixMath.vecMat4Multiply(
                            [e.pageX, e.pageY, 0, 1],
                            currentInvTransformationMatrix
                        );                      

                        handleMoveEnd(invTransformedPos[0], invTransformedPos[1]);
                    }

                    if(currentGroupTransformationContainerBeingDragged !== null) {
                        currentGroupTransformationContainerBeingDragged.endTranslate();
                        currentGroupTransformationContainerBeingDragged = null;
                    }

                    if(multiObjectSelectionStarted) {
                        handleMultiObjectSelectionEnd();
                    }

                    objectIdBeingDragged = null;
                    objectIdBeingResized = null;
                }
            });  

            _canvasDomElement.addEventListener('mousedown', function (e) {
                // if we're dragging something, stop propagation
                if(currentGroupTransformationContainerBeingDragged !== null || objectIdBeingDragged !== null || objectIdBeingResized !== null) {
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
     * @param {Element[]} _translateHandleDomElements
     * @param {Element[]} _resizeHandleDomElements
     */
    function CanvasObject(_id, _x, _y, _width, _height, _canvas, _domElement, _translateHandleDomElements, _resizeHandleDomElements) {

        const self = this;

        const MOUSE_MIDDLE_BUTTON = 1;

        /**
         * @type {ConnectorAnchor[]}
         */
        const connectorAnchors = [];

        /**
         * @type {Number}
         */
        var nextConnectorAnchorIdSuffix = 1000;

        /**
         * @type {Element}
         */
        var currentTranslateHandleElementActivated = null;

        /**
         * @type {Element}
         */
        var currentResizeHandleElementActivated = null;

        const Event = {
            TRANSLATE_START: 'obj-translate-start',
            TRANSLATE: 'obj-translate',
            RESIZE_START: 'obj-resize-start',
            RESIZE: 'obj-resize'
        };

        const eventNameToHandlerFunc = new Map();

        let x = null;
        let y = null;
        let width = null;
        let height = null;

        /**
         * @param {Element} _connectorAnchorDomElement
         * @returns {ConnectorAnchor}
         */    
        this.addNonInteractableConnectorAnchor = function(_connectorAnchorDomElement) {
            const newAnchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _canvas);
            connectorAnchors.push(newAnchor);
            nextConnectorAnchorIdSuffix++;
            return newAnchor;
        };

        /**
         * @param {Element} _connectorAnchorDomElement
         * @returns {ConnectorAnchor}
         */    
        this.addInteractableConnectorAnchor = function(_connectorAnchorDomElement) {     
            const anchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _canvas);

            _connectorAnchorDomElement.addEventListener('click', function(e) {
                _canvas.addConnectionAnchorToSelectionStack(anchor);
            });

            connectorAnchors.push(anchor);
            nextConnectorAnchorIdSuffix++;
            return anchor;
        };

        /**
         * 
         * @param {Number} _gridSize 
         * @returns {Point[]}
         */
        this.getConnectorAnchorRoutingPoints = function(_gridSize) {
            const allRoutingPoints = [];
            connectorAnchors.forEach(function(_anchor) {
                const anchorPoints = _anchor.getRoutingPoints(_gridSize);
                anchorPoints.forEach(function(_pt) {
                    allRoutingPoints.push(_pt);
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
         * 
         * @param {ConnectorAnchor} _anchor 
         * @returns {Boolean}
         */
        this.hasConnectorAnchor = function(_anchor) {
            const anchors = self.getConnectorAnchors();
            for(let i=0; i<anchors.length; i++) {
                if(anchors[i] === _anchor) {
                    return true;
                }
            }

            return false;
        };

        /**
         * @returns {Point|null}
         */    
        this.getTranslateHandleOffset = function() {
            if(currentTranslateHandleElementActivated) {
                return new Point(
                    -(currentTranslateHandleElementActivated.offsetLeft + currentTranslateHandleElementActivated.offsetWidth * 0.5),
                    -(currentTranslateHandleElementActivated.offsetTop  + currentTranslateHandleElementActivated.offsetHeight * 0.5)
                );
            }

            return null;
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
            return x;
        };

        /**
         * @returns {Number}
         */
        this.getY = function() {
            return y;
        };

        /**
         * @param {Number} _x
         * @param {Number} _y
         */
        this.translate = function(_x, _y) {

            if(_x === x && _y === y) {
                return;
            }

            x = _x;
            y = _y;

            _domElement.style.left = x + 'px';
            _domElement.style.top = y + 'px';

            const observers = eventNameToHandlerFunc.get(Event.TRANSLATE) || [];
            observers.forEach(function(handler) {
                handler({"obj":self, "x": _x, "y": _y});
            });
        };

        /**
         * @returns {Number}
         */
        this.getWidth = function() {
            return width;
        };

        /**
         * @returns {Number}
         */
        this.getHeight = function() {
            return height;
        };

        /**
         * @param {Number} _width
         * @param {Number} _height
         * @param {Function} _domElementStyleUpdateOverrideFunc
         */
        this.resize = function(_width, _height, _domElementStyleUpdateOverrideFunc) {            
            width = _width;
            height = _height;

            if(_domElementStyleUpdateOverrideFunc) {
                _domElementStyleUpdateOverrideFunc(_domElement);
            } else {
                _domElement.style.width = width + 'px';
                _domElement.style.height = height + 'px';
            }

            const observers = eventNameToHandlerFunc.get(Event.RESIZE) || [];
            observers.forEach(function(handler) {
                handler({"obj":self, "width": _width, "height": _height});
            });
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
            const left = x;
            const top = y;
            const right = left + width;
            const bottom = top + height;

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
         * @param {String} _eventName 
         * @param {*} _handlerFunc 
         */
        this.on = function(_eventName, _handlerFunc) {
            const allHandlers = eventNameToHandlerFunc.get(_eventName) || [];
            allHandlers.push(_handlerFunc);
            eventNameToHandlerFunc.set(_eventName, allHandlers);    
        };

        /**
         * 
         * @param {String} _eventName 
         * @param {*} _callback 
         */
        this.off = function(_eventName, _callback) {
            const allCallbacks = eventNameToHandlerFunc.get(_eventName) || [];

            for(let i=0; i<allCallbacks.length; i++) {
                if(allCallbacks[i] === _callback) {
                    allCallbacks.splice(i, 1);
                    break;
                }
            }

            eventNameToHandlerFunc.set(_eventName, allCallbacks);
        };

        this.suspendTranslateInteractions = function() {
            unbindTranslateHandleElements();
        };

        this.resumeTranslateInteractions = function() {
            bindTranslateHandleElements();
        };

        const translateTouchStartHandler = function(e) {
            currentTranslateHandleElementActivated = e.target;

            const observers = eventNameToHandlerFunc.get(Event.TRANSLATE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "obj": self,
                    "x": e.touches[0].pageX, 
                    "y": e.touches[0].pageY,
                    "isTouch": true
                });
            });        

        };

        const translateMouseDownHandler = function(e) {
            currentTranslateHandleElementActivated = e.target;
            
            const observers = eventNameToHandlerFunc.get(Event.TRANSLATE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "obj": self,
                    "x": e.pageX, 
                    "y": e.pageY,
                    "isTouch": false
                });
            });        
            
        };

        const unbindTranslateHandleElements = function() {
            _translateHandleDomElements.forEach((_el) => {
                _el.removeEventListener('touchstart', translateTouchStartHandler);        
                _el.removeEventListener('mousedown', translateMouseDownHandler);
            });
        };

        const bindTranslateHandleElements = function() {
            _translateHandleDomElements.forEach((_el) => {
                _el.addEventListener('touchstart', translateTouchStartHandler);        
                _el.addEventListener('mousedown', translateMouseDownHandler);
            });
        };

        const resizeMouseDownHandler = function(e) {
            if (e.which !== MOUSE_MIDDLE_BUTTON) {
                return;
            }

            currentResizeHandleElementActivated = e.target;
            
            const observers = eventNameToHandlerFunc.get(Event.RESIZE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "obj": self,
                    "x": e.pageX, 
                    "y": e.pageY,
                    "isTouch": false
                });
            });    
        };

        const resizeTouchStartHandler = function(e) {
            currentResizeHandleElementActivated = e.target;
            
            const observers = eventNameToHandlerFunc.get(Event.RESIZE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "obj": self,
                    "x": e.touches[0].pageX,  
                    "y": e.touches[0].pageY, 
                    "isTouch": true
                });
            });    
        };    

        const bindResizeHandleElements = function() {
            _resizeHandleDomElements.forEach((_el) => {
                _el.addEventListener('touchstart', resizeTouchStartHandler);  
                _el.addEventListener('mousedown', resizeMouseDownHandler);  
            });
        };


        bindTranslateHandleElements();
        bindResizeHandleElements();
        self.translate(_x, _y);
        self.resize(_width, _height);
    }

    /**
     * @param {Canvas} _canvas
     * @param {CanvasObject[]} _objects
     * @param {String[]} _containerStyleCssClasses
     * @param {Number} _sizeAdjustmentPx
     */
    function GroupTransformationContainer(_canvas, _objects, _containerStyleCssClasses, _sizeAdjustmentPx)  {
        const self = this;
        const eventNameToHandlerFunc = new Map();

        const calculateBoundingRect = function() {
            var r = _canvas.calcBoundingRectForObjects(_objects);
            if(_sizeAdjustmentPx) {
                r = r.getUniformlyResizedCopy(_sizeAdjustmentPx);
            }

            return r;
        };

        var boundingRect = calculateBoundingRect();

        var accTranslateX = 0.0;
        var accTranslateY = 0.0;    

        var currentLeft = boundingRect.getLeft();
        var currentTop = boundingRect.getTop();

        const objPositionRelativeToBoundingRect = [];

        _objects.forEach(function(_obj) {
            const rp = {
                "x": _obj.getX() - currentLeft,
                "y": _obj.getY() - currentTop
            };

            objPositionRelativeToBoundingRect.push(rp);
        });

        const selBox = window.document.createElement("div");
        selBox.classList.add('ia-group-transformation-container');
        selBox.style.display = "none";
        selBox.style.position = "absolute";
        selBox.style.left = `${currentLeft}px`;
        selBox.style.top = `${currentTop}px`;
        selBox.style.width = `${boundingRect.getWidth()}px`;
        selBox.style.height = `${boundingRect.getHeight()}px`;    

        // only display the container if we have 1+ object in the group
        if(_objects.length > 0) {
            selBox.style.display = "block";
        }

        if(typeof _containerStyleCssClasses === 'undefined' || _containerStyleCssClasses.length === 0) {
            // default styling if no classes are provided
            selBox.style.border = "1px solid rgb(158, 158, 158)";
            selBox.style.backgroundColor = "rgba(153, 153, 153, 0.5)";       
        } else {
            // CSS classes will control styling for things GraphPaper doesn't care about
            // (GraphPaper style concerns are handled via inline styles which will always take precedance)
            _containerStyleCssClasses.forEach(function(_class) {
                selBox.classList.add(_class);
            });
        }


        this.getContainerDomElement = function() {
            return selBox;
        };
        
        /**
         * @returns {CanvasObject[]}
         */
        this.getObjects = function() {
            return _objects;
        };

        /**
         * @param {Number} _dx
         * @param {Number} _dy
         */
        this.translateByOffset = function(_dx, _dy) {
            accTranslateX += _dx;
            accTranslateY += _dy;

            currentLeft = _canvas.snapToGrid(boundingRect.getLeft() + accTranslateX);
            currentTop = _canvas.snapToGrid(boundingRect.getTop() + accTranslateY);
            selBox.style.left = `${currentLeft}px`;
            selBox.style.top = `${currentTop}px`;        

            for(let i=0; i<_objects.length; i++) {
                const obj = _objects[i];
                const rp = objPositionRelativeToBoundingRect[i];

                obj.translate(
                    _canvas.snapToGrid(currentLeft + rp.x), 
                    _canvas.snapToGrid(currentTop + rp.y)
                );
            }
        };

        this.endTranslate = function() {
            accTranslateX = 0.0;
            accTranslateY = 0.0;
            boundingRect = calculateBoundingRect();
        };

        this.initTranslateInteractionHandler = function() {
            selBox.addEventListener('touchstart', translateTouchStartHandler);        
            selBox.addEventListener('mousedown', translateMouseDownHandler);
        };

        /**
         * 
         * @param {String} _eventName 
         * @param {*} _handlerFunc 
         */
        this.on = function(_eventName, _handlerFunc) {
            const allHandlers = eventNameToHandlerFunc.get(_eventName) || [];
            allHandlers.push(_handlerFunc);
            eventNameToHandlerFunc.set(_eventName, allHandlers);        
        };

        /**
         * 
         * @param {String} _eventName 
         * @param {*} _callback 
         */
        this.off = function(_eventName, _callback) {
            const allCallbacks = eventNameToHandlerFunc.get(_eventName) || [];

            for(let i=0; i<allCallbacks.length; i++) {
                if(allCallbacks[i] === _callback) {
                    allCallbacks.splice(i, 1);
                    break;
                }
            }

            eventNameToHandlerFunc.set(_eventName, allCallbacks);
        };

        const translateTouchStartHandler = function(e) {
            const observers = eventNameToHandlerFunc.get(GroupTransformationContainerEvent.TRANSLATE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "container": self,
                    "x": e.touches[0].pageX, 
                    "y": e.touches[0].pageY,
                    "isTouch": true
                });
            });        

        };

        const translateMouseDownHandler = function(e) {       
            const observers = eventNameToHandlerFunc.get(GroupTransformationContainerEvent.TRANSLATE_START) || [];
            observers.forEach(function(handler) {
                handler({
                    "container": self,
                    "x": e.pageX, 
                    "y": e.pageY,
                    "isTouch": false
                });
            });        
            
        };    
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
         * @param {CanvasObject} _objA
         * @param {CanvasObject} _objB
         * @returns {Boolean}
         */
        this.areObjectsClose = function(_objA, _objB) {

            const nA = new Rectangle(
                _objA.getX() - _boxExtentOffset, 
                _objA.getY() - _boxExtentOffset, 
                _objA.getX() + _objA.getWidth() + _boxExtentOffset, 
                _objA.getY() + _objA.getHeight() + _boxExtentOffset
            );

            const nB = new Rectangle(
                _objB.getX() - _boxExtentOffset, 
                _objB.getY() - _boxExtentOffset, 
                _objB.getX() + _objB.getWidth() + _boxExtentOffset, 
                _objB.getY() + _objB.getHeight() + _boxExtentOffset
            );
            
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

    exports.BoxClusterDetector = BoxClusterDetector;
    exports.Canvas = Canvas;
    exports.CanvasEvent = CanvasEvent;
    exports.CanvasObject = CanvasObject;
    exports.Cluster = Cluster;
    exports.Connector = Connector;
    exports.ConnectorAnchor = ConnectorAnchor;
    exports.ConnectorEvent = ConnectorEvent;
    exports.Dimensions = Dimensions;
    exports.GRID_STYLE = GRID_STYLE;
    exports.Grid = Grid;
    exports.GroupTransformationContainer = GroupTransformationContainer;
    exports.GroupTransformationContainerEvent = GroupTransformationContainerEvent;
    exports.LINE_INTERSECTION_TYPE = LINE_INTERSECTION_TYPE;
    exports.Line = Line;
    exports.LineIntersection = LineIntersection;
    exports.MatrixMath = MatrixMath;
    exports.Point = Point;
    exports.PointVisibilityMap = PointVisibilityMap;
    exports.Rectangle = Rectangle;
    exports.SvgPathBuilder = SvgPathBuilder;

    return exports;

}({}));
