import  {CanvasObject} from './CanvasObject';
import  {Rectangle} from './Rectangle';
import  {Point} from './Point';

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
    }

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
};

export { Canvas };
