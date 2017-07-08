(function (exports) {
'use strict';

/**
 * 
 * @param {Number} _width
 * @param {Number} _height
 */
function Dimensions(_width, _height) {
    this.getWidth = function() {
        return _width;
    };

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
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {
    this.getX = function() {
        return _x;
    };

    this.getY = function() {
        return _y;
    };
}

/**
 * 
 * @param {Element} _canvasDomElement 
 */
function Canvas(_canvasDomElement, _handleCanvasInteraction) {

    var self = this;
    
    var gridSize = 12.0;

    /**
     * @returns {Number}
     */
    this.getGridSize = function() {
        return gridSize;
    };

    var useTranslate3d = false; // better performance w/o it
    var canvasObjects = [];

    this.objectIdBeingDragged = null;
    this.objectIdBeingResized = null;
    
    this.objectDragX = 0.0;
    this.objectDragY = 0.0;
    this.objectDragStartX = 0.0;
    this.objectDragStartY = 0.0;

    var dblTapDetectVars = {
        lastTouchX: null,
        lastTouchY: null,
        lastTouchTime: null
    };

    var scaleFactor = 1.0;
    var invScaleFactor = 1.0;

    /**
     * @param {Number} _scaleFactor
     * @returns {Number}
     */
    this.setScaleFactor = function(_scaleFactor) {
        scaleFactor = _scaleFactor;
        invScaleFactor = 1.0 / scaleFactor;
        _canvasDomElement.style.transform = "scale3d(" + scaleFactor + "," + scaleFactor + "," + scaleFactor + ")";
        return scaleFactor;
    };

    /**
     * @returns {Number}
     */
    this.getScaleFactor = function() {
        return scaleFactor;
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
        canvasObjects.push(_obj);
    };

    /**
     * @param {Number} _posX 
     * @param {Number} _posY 
     */
    var dblClickTapHandler = function(_posX, _posY) {
        var objectsAroundPoint = self.getObjectsAroundPoint(_posX, _posY);
        if (objectsAroundPoint.length === 0) {
            _handleCanvasInteraction('dbl-click', new Point(_posX, _posY));
        }
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
            if(e.target === _canvasDomElement) {
                _handleCanvasInteraction('click', {'canvasObjectClicked': false});
            } else {
                _handleCanvasInteraction('click', {'canvasObjectClicked': true});
            }
        });

        // touchend on canvas, logic to see if there was a double-tap
        _canvasDomElement.addEventListener('touchend', function(e) {
            if(e.originalEvent.changedTouches.length <= 0) {
                return false; // we have nothing to work with
            }

            var dblTapDetected = false;  // flag specifying if we detected a double-tap

            // Position of the touch
            var x = e.originalEvent.changedTouches[0].pageX;
            var y = e.originalEvent.changedTouches[0].pageY;

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
     * @param {Number} _x 
     * @param {Number} _y 
     */
    var handleMove = function(_x, _y) {
        var obj = self.getObjectById(self.objectIdBeingDragged);
        if(obj.touchInternalContactPt) {
            // Move relative to point of contact
            _x -= obj.touchInternalContactPt.getX();
            _y -= obj.touchInternalContactPt.getY();
        }

        var mx = self.snapToGrid(_x + obj.getTranslateHandleOffsetX());
        var my = self.snapToGrid(_y + obj.getTranslateHandleOffsetY());
        
        self.objectDragX = mx;
        self.objectDragY = my;		

        obj.translate(mx, my);
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    var handleMoveEnd = function(_x, _y) {
        var obj = self.getObjectById(self.objectIdBeingDragged);
        
        var mx = self.snapToGrid(_x + obj.getTranslateHandleOffsetX());
        var my = self.snapToGrid(_y + obj.getTranslateHandleOffsetY());

        var mxStart = self.objectDragStartX;
        var myStart = self.objectDragStartY;

        if(mxStart == mx && myStart == my) {
            // we didn't drag it anywhere
        } else {
            obj.translate(mx, my);
            _handleCanvasInteraction('object-translated', obj);
        }
    };     

    this.initTransformationHandlers = function() {
        
        _canvasDomElement.addEventListener('touchmove', function (e) {
            if (self.objectIdBeingDragged !== null) {
                handleMove(e.touches[0].pageX * invScaleFactor, e.touches[0].pageY * invScaleFactor);       
            }
        });

        _canvasDomElement.addEventListener('mousemove', function (e) {

            if (self.objectIdBeingDragged !== null) {				
                handleMove(e.pageX * invScaleFactor, e.pageY * invScaleFactor);
            }

            if(self.objectIdBeingResized !== null) {

                var mx = self.snapToGrid(e.pageX * invScaleFactor);
                var my = self.snapToGrid(e.pageY * invScaleFactor);

                var obj = self.getObjectById(self.objectIdBeingResized);

                var top = obj.getY();
                var left = obj.getX();
                var newWidth = ((mx - left)+1);
                var newHeight = ((my - top)+1);

                obj.resize(newWidth, newHeight);
                _handleCanvasInteraction('object-resized', obj);
            }
        });

        _canvasDomElement.addEventListener('touchend', function (e) {
            if(self.objectIdBeingDragged !== null) {
                var obj = self.getObjectById(self.objectIdBeingDragged);

                obj.touchInternalContactPt = null;
                self.objectIdBeingDragged = null;
                self.objectIdBeingResized = null;  
            }            
        });

        _canvasDomElement.addEventListener('mouseup', function (e) {
            if (e.which === 1) {
                if(self.objectIdBeingDragged !== null) {
                    handleMoveEnd(e.pageX * invScaleFactor, e.pageY * invScaleFactor);
                }            

                if(self.objectIdBeingResized !== null) {
                    //var obj = self.getObjectById(self.objectIdBeingResized);
                    //self.reqEnableObjectSelection();                    
                    //self.onObjectTransform(obj);
                }

                self.objectIdBeingDragged = null;
                self.objectIdBeingResized = null;
            }
        });  

        _canvasDomElement.addEventListener('mousedown', function (e) {
            if(self.objectIdBeingDragged !== null || self.objectIdBeingResized !== null) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };
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

    var self = this;

    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
    this.domElement = _domElement;
    this.isDeleted = false;
    this.touchInternalContactPt = null;

    this.getTranslateHandleOffsetX = function() {
        return -(_translateHandleDomElement.offsetLeft + _translateHandleDomElement.offsetWidth * 0.5);
    };

    this.getTranslateHandleOffsetY = function() {
        return -(_translateHandleDomElement.offsetTop  + _translateHandleDomElement.offsetHeight * 0.5);
    };

    /**
     * @returns {Number}
     */
    this.getId = function() {
        return self.id;
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

        self.domElement.style.left = parseInt(self.x) + 'px';
        self.domElement.style.top = parseInt(self.y) + 'px';
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

        self.domElement.style.width = parseInt(self.width) + 'px';
        self.domElement.style.height = parseInt(self.height) + 'px';
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
        return self.domElement;
    };

    /**
     * @returns {Point}
     */
    this.getTouchInternalContactPt = function() {
        return self.touchInternalContactPt;
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
        var left = parseInt(self.x);
        var top = parseInt(self.y);
        var right = left + parseInt(self.width);
        var bottom = top + parseInt(self.height);

        return new Rectangle(left, top, right, bottom);
    };

    var translateStart = function(e) {

        if(e.touches) {
            self.touchInternalContactPt = new Point(
                e.touches[0].pageX-self.getX(),
                e.touches[0].pageY-self.getY()
            );
        }
        
        var mx = e.pageX;
        var my = e.pageY;

        _canvas.objectIdBeingDragged = self.getId();
        _canvas.objectDragX = mx;
        _canvas.objectDragY = my;

        _canvas.objectDragStartX = mx;
        _canvas.objectDragStartY = my;
    };

    _translateHandleDomElement.addEventListener('touchstart', function(e) {
        translateStart(e);
    });

    _translateHandleDomElement.addEventListener('mousedown', function (e) {
        translateStart(e);
    });

    _resizeHandleDomElement.addEventListener('mousedown', function (e) {
        if (e.which !== 1) {
            return;
        }

        _canvas.objectIdBeingResized = self.getId();
    });    
}

exports.Dimensions = Dimensions;
exports.Rectangle = Rectangle;
exports.Point = Point;
exports.CanvasObject = CanvasObject;
exports.Canvas = Canvas;

}((this.GraphPaper = this.GraphPaper || {})));
