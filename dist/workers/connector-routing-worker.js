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


        const arePointsVisibleToEachOther = function(_ptA, _ptB) {
            for(let i=0; i<freePointsArr.length; i++) {
                if(freePointsArr[i].isEqual(_ptA)) {
                    const visiblePointIndices = pointToVisibleSet[i];
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
            return pointToVisibleSet[_pointIndex] || [];
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
                }
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
                }
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
            computePointsVisibility();        
        }
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
        const optimizeRoute = _connectorDescriptor.allow_route_optimization;
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

        const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd, optimizeRoute);
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

    const convertArrayBufferToFloat64Array = function(_ab) {
        return new Float64Array(_ab);
    };


    const requestQueue = [];
    const processRequestQueue = function() {
        if(requestQueue.length === 0) {
            return;
        }

        // grab last request, toss the rest
        const lastRequest = requestQueue.pop();
        requestQueue.length = 0;

        // process request
        const metrics = {};
        metrics.overallTime = null;
        const overallTimeT1 = new Date();

        const gridSize = lastRequest.gridSize;
        const connectorDescriptors = lastRequest.connectorDescriptors;

        const msgDecodeTimeT1 = new Date();
        const routingPointsSet = new PointSet(convertArrayBufferToFloat64Array(lastRequest.routingPoints));
        const boundaryLinesSet = new LineSet(convertArrayBufferToFloat64Array(lastRequest.boundaryLines));    
        const routingPointsAroundAnchorSet = new PointSet(convertArrayBufferToFloat64Array(lastRequest.routingPointsAroundAnchor));    
        metrics.msgDecodeTime = (new Date()) - msgDecodeTimeT1;
        
        const pointVisibilityMapCreationTimeT1 = new Date();
        const currentPointVisiblityMap = new PointVisibilityMap(
            routingPointsSet,
            boundaryLinesSet
        );
        metrics.pointVisibilityMapCreationTime = (new Date()) - pointVisibilityMapCreationTimeT1;

        const pathComputationTimeT1 = new Date();
        connectorDescriptors.forEach(function(_cd) {
            const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap);

            const pointsInPathPointSet = new PointSet(pathData.pointsInPath);

            _cd.svgPath = pathData.svgPath;
            _cd.pointsInPath = pointsInPathPointSet.toFloat64Array().buffer;
        });
        metrics.allPathsComputationTime = (new Date()) - pathComputationTimeT1;
        
        metrics.numRoutingPoints = routingPointsSet.count();
        metrics.numBoundaryLines = boundaryLinesSet.count();
        metrics.overallTime = (new Date()) - overallTimeT1;

        postMessage(
            {
                "routingPoints": lastRequest.routingPoints,
                "boundaryLines": lastRequest.boundaryLines,
                "connectorDescriptors": connectorDescriptors,
                "pointVisibilityMapData": currentPointVisiblityMap.getPointToVisibleSetData(),
                "metrics": metrics
            }
        );

    };

    setInterval(processRequestQueue, 6);

    onmessage = function(_req) {
        requestQueue.push(_req.data);
    };

}());
