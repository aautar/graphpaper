import  {CanvasObject} from './CanvasObject';
import  {Rectangle} from './Rectangle';
import  {Point} from './Point';
import  {Line} from './Line';
import  {PointSet} from './PointSet';
import  {LineSet} from './LineSet';
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

    var useTranslate3d = false; // better performance w/o it
    const canvasObjects = [];
    const objectConnectors = [];

    var objectIdBeingDragged = null;
    var objectIdBeingResized = null;
    
    var objectDragX = 0.0;
    var objectDragY = 0.0;
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
    }

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
     * @returns {Connector}
     */
    this.makeNewConnectorFromAnchors = function(_anchorA, _anchorB) {
        const newConnector = makeNewConnector(_anchorA, _anchorB, connectorsContainerDomElement);
        const foundConnector = self.getConnector(newConnector.getId());

        if(foundConnector === null) {
            objectConnectors.push(newConnector);
            newConnector.appendPathToContainerDomElement();
            refreshAllConnectors();
            return newConnector;
        }

        return foundConnector;
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
        objectDragX = _x;
        objectDragY = _y;
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
        
        objectDragX = mx;
        objectDragY = my;		

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

                if(objectIdBeingResized !== null) {
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
};

export { Canvas };
