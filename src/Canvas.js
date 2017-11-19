import  {CanvasObject} from './CanvasObject';
import  {Rectangle} from './Rectangle';
import  {Point} from './Point';
import  {Line} from './Line';
import  {PointSet} from './PointSet';
import  {Connector} from './Connector';
import  {PointVisibilityMap} from './PointVisibilityMap';
import  {GRID_STYLE, Grid} from './Grid';

/**
 * @callback HandleCanvasInteractionCallback
 * @param {String} interactionType
 * @param {Object} interactionData
 */ 

 /**
 * @param {Element} _canvasDomElement 
 * @param {HandleCanvasInteractionCallback} _handleCanvasInteraction 
 * @param {Window} _window
 */
function Canvas(_canvasDomElement, _handleCanvasInteraction, _window) {

    const self = this;

    // Create container for SVG connectors
    const svgElem = _window.document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElem.style.width = "100%";
    svgElem.style.height = "100%";
    const connectorsContainerDomElement = _canvasDomElement.appendChild(svgElem);
   
    /**
     * @type {Grid}
     */
    var grid = null;

    /**
     * @param {Grid} _grid
     */
    this.setGrid = function(_grid) {
        grid = _grid;
        _canvasDomElement.style.background = "url('data:image/svg+xml;base64," + _window.btoa(grid.getSvgImageTile()) + "') repeat";
    };
    self.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

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

    var currentPointVisiblityMap = null;

    /**
     * @returns {PointVisibilityMap}
     */
    this.getCurrentPointVisibilityMap = function() {
        return currentPointVisiblityMap;
    };

    var useTranslate3d = false; // better performance w/o it
    const canvasObjects = [];
    const objectConnectors = [];

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

    const connectorAnchorsSelected = [];


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
        });

        return boundaryLines;
    };    

    const refreshAllConnectors = function() {
        const anchorPoints = getConnectorAnchorPoints();
        const currentPointVisiblityMap = new PointVisibilityMap(
            getConnectorRoutingPoints(),
            getConnectorBoundaryLines()
        );

        objectConnectors.forEach(function(_c) {
            _c.refresh(anchorPoints, currentPointVisiblityMap, self.getGridSize());
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
        refreshAllConnectors();       
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
     * @param {ConnectorAnchor} _anchor
     */
    this.addConnectionAnchorToSelectionStack = function(_anchor) {
        connectorAnchorsSelected.push(_anchor);

        if(connectorAnchorsSelected.length === 2) {
            const newConnector = makeNewConnector(connectorAnchorsSelected[0], connectorAnchorsSelected[1], connectorsContainerDomElement);
            const foundConnector = self.getConnector(newConnector.getId());

            connectorAnchorsSelected.length = 0;
            if(foundConnector === null) {
                objectConnectors.push(newConnector);
                newConnector.appendPathToContainerDomElement();
                refreshAllConnectors();
            }
        }
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

        // refresh connectors
        refreshAllConnectors();
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

                // refresh connectors
                refreshAllConnectors();

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
