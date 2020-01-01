import {MatrixMath} from './MatrixMath';
import {CanvasEvent} from './CanvasEvent';
import {CanvasObject} from './CanvasObject';
import {Rectangle} from './Rectangle';
import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import {LineSet} from './LineSet';
import {GroupTransformationContainer} from './GroupTransformationContainer';
import {Connector} from './Connector';
import {PointVisibilityMap} from './PointVisibilityMap';
import {GRID_STYLE, Grid} from './Grid';
import { GroupTransformationContainerEvent } from './GroupTransformationContainerEvent';

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

    var useTranslate3d = false; // better performance w/o it
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

    var dblTapDetectVars = {
        lastTouchX: null,
        lastTouchY: null,
        lastTouchTime: null
    };

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

    var connectorRefreshTimeout = null;

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
        _connectorRoutingWorker.postMessage(
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
    };

    this.refreshAllConnectors = function() {

        // We'll try to coalesce refresh calls within 6.944ms
        // For continuous calls, this corresponds to 144Hz, but actual
        // performance is less given web worker overhead & path computation cost
        
        if(connectorRefreshTimeout !== null) {
            clearTimeout(connectorRefreshTimeout);
        }

        connectorRefreshTimeout = setTimeout(function() {
            connectorRefreshTimeout = null;
            refreshAllConnectorsInternal();
        }, 6.94);
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
                const ps = new PointSet(new Float64Array(descriptor.pointsInPath));
                _c.refresh(descriptor.svgPath, ps.toArray());
                emitEvent(CanvasEvent.CONNECTOR_UPDATED, { 'connector': _c });
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
            const objAConnectorAnchors = _searchData.objectA.getConnectorAnchors();
            const objBConnectorAnchors = _searchData.objectB.getConnectorAnchors();
    
            var startAnchorIdxWithMinDist = 0;
            var endAnchorIdxWithMinDist = 0;
            var minDist = Number.MAX_VALUE;
            
            // Find best anchor element to connect startNote and endNote            
            // Find anchors that produce shortest straight line distance
            for(let x=0; x<objAConnectorAnchors.length; x++) {

                const objANumValidRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(objAConnectorAnchors[x].getId()) || 0;
                if(objANumValidRoutingPoints === 0) {
                    continue;
                }

                for(let y=0; y<objBConnectorAnchors.length; y++) {
                    const aCentroid = objAConnectorAnchors[x].getCentroid();
                    const bCentroid = objBConnectorAnchors[y].getCentroid();
                    
                    const d = Math.sqrt(Math.pow(bCentroid.getX()-aCentroid.getX(),2) + Math.pow(bCentroid.getY()-aCentroid.getY(),2));
                    const objBNumValidRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(objBConnectorAnchors[y].getId()) || 0;
                    
                    if(d < minDist && objBNumValidRoutingPoints > 0) {
                        startAnchorIdxWithMinDist = x;
                        endAnchorIdxWithMinDist = y;
                        minDist = d;
                    }
                }
            }
    
            _searchData.cb(
                {
                    "objectAAnchorIndex": startAnchorIdxWithMinDist,
                    "objectAAnchor": objAConnectorAnchors[startAnchorIdxWithMinDist],
                    "objectBAnchorIndex": endAnchorIdxWithMinDist,
                    "objectBAnchor": objBConnectorAnchors[endAnchorIdxWithMinDist],
                }
            );
        };


        setTimeout(function() {
            searchFunc(
                {
                    "objectA": _objA,
                    "objectB": _objB,
                    "cb": _onFound
                }
            );
        }, 10);
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

    /**
     * @param {Number} _dblTapSpeed
     * @param {Number} _dblTapRadius
     */
    this.initInteractionHandlers = function(_dblTapSpeed, _dblTapRadius) {

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
            if(e.changedTouches.length <= 0) {
                return false; // we have nothing to work with
            }

            var dblTapDetected = false;  // flag specifying if we detected a double-tap

            // Position of the touch
            const invTransformedPos = MatrixMath.vecMat4Multiply(
                [e.changedTouches[0].pageX, e.changedTouches[0].pageY, 0, 1],
                currentInvTransformationMatrix
            );            

            var x = invTransformedPos[0];
            var y = invTransformedPos[1];            

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
            multiObjectSelectionStartX, 
            multiObjectSelectionStartY, 
            multiObjectSelectionEndX, 
            multiObjectSelectionEndY
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
            const hasSelectionStarted = handleMultiObjectSelectionStart(e.touches[0].pageX, e.touches[0].pageY, e.target);
            if(hasSelectionStarted) {
                e.preventDefault(); // prevents text selection from triggering
            }            
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
                multiObjectSelectionEndX = e.touches[0].pageX;
                multiObjectSelectionEndY = e.touches[0].pageY;
                const width = multiObjectSelectionEndX - multiObjectSelectionStartX;
                const height = multiObjectSelectionEndY - multiObjectSelectionStartY;
                selectionBoxElem.style.width = `${width}px`;
                selectionBoxElem.style.height = `${height}px`;
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
                multiObjectSelectionEndX = e.pageX;
                multiObjectSelectionEndY = e.pageY;
                const width = multiObjectSelectionEndX - multiObjectSelectionStartX;
                const height = multiObjectSelectionEndY - multiObjectSelectionStartY;
                selectionBoxElem.style.width = `${width}px`;
                selectionBoxElem.style.height = `${height}px`;
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

                if(objectIdBeingResized !== null) {
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
};

export { Canvas };
