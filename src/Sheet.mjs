import { MatrixMath } from './MatrixMath.mjs';
import { BestToConnectEntitiesFinder } from './ConnectorAnchorFinder/BestToConnectEntitiesFinder.mjs';
import { SheetEvent } from './SheetEvent.mjs';
import { Entity } from './Entity.mjs';
import { EntityEvent } from './EntityEvent.mjs';
import { DebugMetricsPanel } from './DebugMetricsPanel/DebugMetricsPanel.mjs';
import { DoubleTapDetector } from './DoubleTapDetector.mjs';
import { Rectangle } from './Rectangle.mjs';
import { Point } from './Point.mjs';
import { PointSet } from './PointSet.mjs';
import { Connector } from './Connector.mjs';
import { GRID_STYLE, Grid } from './Grid.mjs';
import { ClusterDetectionWorkerJsString } from './Workers/ClusterDetectionWorker.string.mjs';
import { ConnectorRoutingWorkerJsString } from './Workers/ConnectorRoutingWorker.string.mjs';
import { Cluster } from './Cluster.mjs';
import { Originator } from './Originator.mjs';

/**
 * @callback HandleSheetInteractionCallback
 * @param {String} interactionType
 * @param {Object} interactionData
 */ 

/**
 * Sheet event callback
 * 
 * @callback SheetEventCallback
 * @param {Object} eventData
 */

 /**
 * @param {Element} _sheetDomElement 
 * @param {Window} _window
 */
function Sheet(_sheetDomElement, _window) {
    const self = this;

    // Create container for SVG connectors
    const svgElem = _window.document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElem.style.width = "100%";
    svgElem.style.height = "100%";
    const connectorsContainerDomElement = _sheetDomElement.appendChild(svgElem);

    /**
     * Selection box DOM Element, shown when the user drags to select multiple entities
     * 
     * @type {Element}
     */
    var selectionBoxElem = null;
 
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

    let boundingExtentRoutingPointScaleFactor = 1.0;

    const invTransformationMatrixStack = [];
    var currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var currentTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    var connectorRefreshBufferTime = 6.94;
    var useTranslate3d = false; // better performance w/o it
    const sheetEntities = [];

    /**
     * @type {Connector[]}
     */
    const objectConnectors = [];

    var objectIdBeingDragged = null;
    var objectIdBeingResized = null;
    var objectResizeCursor = "default";
    
    var objectDragX = 0.0;
    var objectDragY = 0.0;
    var objectDragStartX = 0.0;
    var objectDragStartY = 0.0;

    var doubleTapDetector = null;
    const debugMetricsPanel = new DebugMetricsPanel(_window);

    const metrics = {
        connectorRoutingWorker: {
            executionTime: null,
            numRoutingPoints: null,
            numBoundaryLines: null,
            msgDecodeTime: null,
            pointVisibilityMapCreationTime: null,
            allPathsComputationTime: null
        },
        clusterDetectionWorker: {
            computeClustersTime: null,
        },
        refreshAllConnectorsInternal: {
            executionTime: null
        },
        findBestConnectorAnchorsToConnectEntities: {
            batchSize: null,
            searchFuncExecutionTime: null
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

    // DOM attribute cache to prevent reflow
    let isDomMetricsLockActive = false;
    let sheetOffsetLeft = null;
    let sheetOffsetTop = null;
    let sheetPageScrollXOffset = null;
    let sheetPageScrollYOffset = null;

    /**
     * Event name -> Callback map
     * 
     * @type {Map<string, SheetEventCallback>}
     */
    const eventHandlers = new Map();

    var connectorRefreshStartTime = null;
    var connectorRefreshTimeout = null;
    let pendingConnectorRedraw = false;


    const bestConnectorAnchorsForEntityConnectionsFinder = new BestToConnectEntitiesFinder();

    // Setup ClusterDetectionWorker

    /**
     * JSON representation of known clusters
     * @type {Object[]|null}
     */
    let knownClustersOverwrite = null;

    const clusterDetectionWorkerUrl = URL.createObjectURL(new Blob([ ClusterDetectionWorkerJsString ]));
    let clusterDetectionWorker = null;

    this.initClusterDetectionWorker = function() {
        clusterDetectionWorker = new Worker(clusterDetectionWorkerUrl);
        
        clusterDetectionWorker.onmessage = function(_msg) {
            const data = _msg.data;

            data.newClusterIds.forEach((_cId) => {
                emitEvent(SheetEvent.CLUSTER_CREATED, { 'cluster': Cluster.fromJSON(data.clusters.get(_cId)) });
            });

            data.updatedClusterIds.forEach((_cId) => {
                const eventObj = { 
                    "cluster": Cluster.fromJSON(data.clusters.get(_cId)),
                    "entitiesAdded": data.updatedClusterToAddedEntitites.get(_cId),
                    "entitiesRemoved": data.updatedClusterToRemovedEntitites.get(_cId),
                };

                emitEvent(
                    SheetEvent.CLUSTER_UPDATED, 
                    eventObj
                );
            });

            data.deletedClusterIds.forEach((_cId) => {
                emitEvent(SheetEvent.CLUSTER_DELETED, { 'clusterId': _cId });
            });

            for(let [entityId, overlappingEntityIds] of data.overlappingEntities) {
                emitEvent(
                    SheetEvent.ENTITY_OVERLAP_DETECTED, 
                    { 
                        "entityId": entityId,
                        "overlappingEntityIds": overlappingEntityIds,
                    }
                );
            }

            metrics.clusterDetectionWorker.computeClustersTime = data.metrics.computeClustersTime;

            knownClustersOverwrite = null;
        };
    };

    /**
     * @param {Cluster[]} _clusters 
     */
     this.overwriteClusterDetectorKnownClusters = function(_clusters) {
        const _clusterJSON = [];
        _clusters.forEach((_c) => {
            _clusterJSON.push(_c.toJSON());
        });

        knownClustersOverwrite = _clusterJSON;
    };

    /**
     * @param {Cluster} _cluster
     */
     this.updateClusterDetectorKnownCluster = function(_cluster) {
        if(knownClustersOverwrite === null) {
            knownClustersOverwrite = [];
        }

        let foundMatch = false;
        for(let i=0; i<knownClustersOverwrite.length; i++) {
            if(knownClustersOverwrite[i].id === _cluster.getId()) {
                foundMatch = true;
                knownClustersOverwrite[i] = _cluster.toJSON();
                break;
            }
        }

        if(!foundMatch) {
            knownClustersOverwrite.push(_cluster.toJSON());
        }
    };

    /**
     * @param {Cluster} _cluster
     * @returns {Boolean}
     */
     this.deleteClusterDetectorKnownCluster = function(_cluster) {
        if(knownClustersOverwrite === null) {
            return false;
        }

        let foundMatch = false;
        for(let i=0; i<knownClustersOverwrite.length; i++) {
            if(knownClustersOverwrite[i].id === _cluster.getId()) {
                foundMatch = true;
                knownClustersOverwrite.splice(i, 1);
                break;
            }
        }

        return foundMatch;
    };

    // Setup ConnectorRoutingWorker
    const connectorRoutingWorkerUrl = URL.createObjectURL(new Blob([ ConnectorRoutingWorkerJsString ]));
    let connectorRoutingWorker = null;

    this.initConnectorRoutingWorker = function() {
        connectorRoutingWorker = new Worker(connectorRoutingWorkerUrl);
    
        connectorRoutingWorker.onmessage = function(_msg) {
            const connectorsRefreshTimeT1 = new Date();
            const connectorDescriptors = _msg.data.connectorDescriptors;
            const refreshCalls = [];

            const getConnectorDescriptorById = function(_id) {
                for(let i=0; i<connectorDescriptors.length; i++) {
                    if(connectorDescriptors[i].id === _id) {
                        return connectorDescriptors[i];
                    }
                }

                return null;
            };

            const renderInternal = function() {
                refreshCalls.forEach((_rc) => {
                    _rc();
                });
                pendingConnectorRedraw = false;
            };


            objectConnectors.forEach(function(_c) {
                const descriptor = getConnectorDescriptorById(_c.getId());
                if(descriptor) {
                    const ps = new PointSet(new Float64Array(descriptor.pointsInPath));
                    _c.updatePathPoints(ps.toArray());

                    refreshCalls.push(() => {
                        _c.refresh(descriptor.svgPath);
                    });

                    // May want defer this, rendering affected if consumer has a long-running handler
                    emitEvent(SheetEvent.CONNECTOR_UPDATED, { 'connector': _c });
                }
            });
            
            if(pendingConnectorRedraw) {
                cancelAnimationFrame(renderInternal);
            }

            pendingConnectorRedraw = true;
            requestAnimationFrame(renderInternal);

            metrics.connectorsRefreshTime = (new Date()) - connectorsRefreshTimeT1;

            metrics.connectorRoutingWorker.executionTime = _msg.data.metrics.overallTime;
            metrics.connectorRoutingWorker.numBoundaryLines = _msg.data.metrics.numBoundaryLines;
            metrics.connectorRoutingWorker.numRoutingPoints = _msg.data.metrics.numRoutingPoints;
            metrics.connectorRoutingWorker.msgDecodeTime = _msg.data.metrics.msgDecodeTime;
            metrics.connectorRoutingWorker.pointVisibilityMapCreationTime = _msg.data.metrics.pointVisibilityMapCreationTime;
            metrics.connectorRoutingWorker.allPathsComputationTime = _msg.data.metrics.allPathsComputationTime;

            debugMetricsPanel.refresh(metrics);
        };
    };

    /**
     * @param {Grid} _grid
     */
    this.setGrid = function(_grid) {
        grid = _grid;
        _sheetDomElement.style.backgroundImage = "url('data:image/svg+xml;base64," + _window.btoa(grid.getSvgImageTile()) + "')";
        _sheetDomElement.style.backgroundRepeat = "repeat";
        _sheetDomElement.style.backgroundColor = "#fff";
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
     * @param {Number} _scaleFactor 
     */
    this.setBoundingExtentRoutingPointScaleFactor = function(_scaleFactor) {
        boundingExtentRoutingPointScaleFactor = _scaleFactor;
    };

    const lockDomMetrics = function() {
        sheetOffsetLeft = _sheetDomElement.offsetLeft;
        sheetOffsetTop = _sheetDomElement.offsetTop;
        sheetPageScrollXOffset = _window.pageXOffset;
        sheetPageScrollYOffset = _window.pageYOffset;

        isDomMetricsLockActive = true;
    };

    const unlockDomMetrics = function() {
        isDomMetricsLockActive = false;
    };

    /**
     * 
     * @returns {Boolean}
     */
    this.hasDomMetricsLock = function() {
        return isDomMetricsLockActive;
    };

    const refreshAllClustersInternal = function() {
        if(clusterDetectionWorker === null) {
            return;
        }

        lockDomMetrics();

        const gridSize = self.getGridSize();

        const entityDescriptors = [];
        sheetEntities.filter((_e) => _e.isAllowedWithinCluster()).forEach(function(_e) {
            entityDescriptors.push(_e.getDescriptor(gridSize));
        });

        const postData = {
            "gridSize": gridSize,
            "entityDescriptors": entityDescriptors,
            "knownClustersOverwrite": knownClustersOverwrite
        };

        clusterDetectionWorker.postMessage(postData, []);
        unlockDomMetrics();
    };

    const refreshAllConnectorsInternal = function() {
        if(connectorRoutingWorker === null) {
            return;
        }

        lockDomMetrics();

        const executionTimeT1 = new Date();
        const connectorDescriptors = [];
        objectConnectors.forEach(function(_c) {
            connectorDescriptors.push(_c.getDescriptor());
        });

        const entityDescriptors = [];
        sheetEntities.forEach(function(_e) {
            entityDescriptors.push(_e.getDescriptor(self.getGridSize()));
        });

        connectorRoutingWorker.postMessage(
            {
                "gridSize": self.getGridSize(),
                "connectorDescriptors": connectorDescriptors,
                "entityDescriptors": entityDescriptors,
                "boundingExtentRoutingPointScaleFactor": boundingExtentRoutingPointScaleFactor
            },
            [

            ]
        );

        metrics.refreshAllConnectorsInternal.executionTime = (new Date()) - executionTimeT1;
        
        unlockDomMetrics();
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
    }

    /**
     * 
     * @param {String} _css 
     */
    this.setTransitionCss = function(_css) {
        transitionCss = _css;
        _sheetDomElement.style.transition = transitionCss;
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
        _sheetDomElement.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`;
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
        _sheetDomElement.style.transform = self.getTransformMatrixCss();
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
    this.getTransformMatrixCss = function() {
        const matElems = currentTransformationMatrix.join(",");
        return `matrix3d(${matElems})`;
    };

    /**
     * @param {DOMRect} _domRect
     * @returns {Rectangle}
     */
    this.transformDomRectToPageSpaceRect = function(_domRect) {
        const pageOffset = self.getPageOffset();
        const sheetOffset = self.getSheetOffset();

        const left = _domRect.left - sheetOffset.getX() + pageOffset.getX();
        const top = _domRect.top - sheetOffset.getY() + pageOffset.getY();
        const right = _domRect.right - sheetOffset.getX() + pageOffset.getX();
        const bottom = _domRect.bottom - sheetOffset.getY() + pageOffset.getY();

        // inv transform
        const invTransformedPosLeftTop = MatrixMath.vecMat4Multiply(
            [left, top, 0, 1],
            currentInvTransformationMatrix
        );

        const invTransformedPosRightBottom = MatrixMath.vecMat4Multiply(
            [right, bottom, 0, 1],
            currentInvTransformationMatrix
        );

        // we have Sheet space coordinates, transform to Page space and return
        return new Rectangle(
            invTransformedPosLeftTop[0] + sheetOffset.getX(), 
            invTransformedPosLeftTop[1] + sheetOffset.getY(), 
            invTransformedPosRightBottom[0] + sheetOffset.getX(), 
            invTransformedPosRightBottom[1] + sheetOffset.getY()
        );
    };

    this.resetTransform = function() {
        scaleFactor = 1.0;
        invScaleFactor = 1.0;
        translateX = 0.0;
        translateY = 0.0;
        currentTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        invTransformationMatrixStack.length = 0;
        _sheetDomElement.style.transform = "none";
    };

    /**
     * @returns {Point}
     */
    this.getPageOffset = function() {
        if(self.hasDomMetricsLock()) {
            return new Point(sheetPageScrollXOffset, sheetPageScrollYOffset);
        }

        return new Point(_window.pageXOffset, _window.pageYOffset);
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
     * @returns {Point}
     */
    this.getSheetOffset = function() {
        if(self.hasDomMetricsLock()) {
            return new Point(sheetOffsetLeft, sheetOffsetTop);
        }
        
        return new Point(_sheetDomElement.offsetLeft, _sheetDomElement.offsetTop);
    };

    /**
     * @returns {Number}
     */
    this.getOffsetLeft = function() {
        return _sheetDomElement.offsetLeft;
    };

    /**
     * @returns {Number}
     */
    this.getOffsetTop = function() {
        return _sheetDomElement.offsetTop;
    };

    /**
     * @returns {Number}
     */
    this.getWidth = function() {
        return _sheetDomElement.offsetWidth;
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        return _sheetDomElement.offsetHeight;
    };

    /**
     * 
     * @param {Number} _newWidth 
     * @param {Number} _newHeight 
     */
    this.resize = function(_newWidth, _newHeight) {
        _sheetDomElement.style.width = `${_newWidth}px`;
        _sheetDomElement.style.height = `${_newHeight}px`;
    };

    /**
     * @param {Entity[]} _objs 
     * @returns {Rectangle}
     */
    this.calcBoundingRectForEntities = function(_entities) {
        var minTop = null;
        var minLeft = null;
        var maxBottom = null;
        var maxRight = null;

        _entities.forEach(function(_obj, index, array) {
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
        if(sheetEntities.length === 0) {    
            return new Rectangle(0, 0, self.getWidth(), self.getHeight());     
        }

        return self.calcBoundingRectForEntities(sheetEntities);
    };

    /**
     * @param {Number} _x
     * @param {Number} _y
     * @param {Number} _radius
     * @returns {Entity[]}
     */
    this.getEntitiesAroundPoint = function(_x, _y, _radius) {
        _radius = _radius || 1.0;

        const result = [];

        const ptRect = new Rectangle(
            _x - _radius, 
            _y - _radius, 
            _x + _radius, 
            _y + _radius
        );

        sheetEntities.forEach(function(_obj) {
            if(ptRect.checkIntersect(_obj.getBoundingRectange())) {
                result.push(_obj);
            }
        });

        return result;
    };

    /**
     * @param {Rectangle} _rect
     * @returns {Entity[]}
     */
    this.getEntitiesWithinRect = function(_rect) {
        const result = [];

        sheetEntities.forEach(function(_obj) {
            if(_obj.getBoundingRectange().checkIsWithin(_rect)) {
                result.push(_obj);
            }
        });

        return result;
    };    
      
    /**
     * @returns {Entity[]}
     */
    this.getAllEntities = function() {    
        return sheetEntities;
    };

    /**
     * @deprecated
     * Helper method to publish an object change to all objects
     * 
     * @param {String} _eventName
     * @param {*} _eventData
     */
    this.publishSiblingObjectChange = function(_eventName, _eventData) {
        sheetEntities.forEach(function(_obj) {
            _obj.handleSiblingObjectChange(_eventName, _eventData);
        });
    };

    /**
     * @param {String} _id
     * @returns {Entity|null}
     */   
    this.getEntityById = function(_id) {
        var foundEntity = null;
        sheetEntities.forEach(function(obj, index, array) {
            if(foundEntity === null && obj.getId() === _id) {
                foundEntity = obj;
            }            
        });
        
        return foundEntity;
    };

    /**
     * @param {Entity} _obj
     */
    this.addEntity = function(_obj) {
        _obj.on(EntityEvent.RESIZE_START, handleResizeStart);

        _obj.on(EntityEvent.RESIZE, function(e) {
            emitEvent(SheetEvent.ENTITY_RESIZED, 
                { 
                    "entity": e.obj,
                    "originator": e.originator,
                }
            );
            self.refreshAllConnectors();
            refreshAllClustersInternal();
        });

        _obj.on(EntityEvent.TRANSLATE_START, handleMoveStart);

        _obj.on(EntityEvent.TRANSLATE, function(e) {
            emitEvent(
                SheetEvent.ENTITY_TRANSLATED, 
                { 
                    "object": e.obj,
                    "withinGroupTransformation": e.withinGroupTransformation,
                    "originator": e.originator,
                }
            );

            if(!e.withinGroupTransformation) { // don't refresh, we only want to refresh when the entire group has been translated
                self.refreshAllConnectors();
                refreshAllClustersInternal();
            }
        });

        sheetEntities.push(_obj);
        self.refreshAllConnectors();
        refreshAllClustersInternal();

        emitEvent(SheetEvent.ENTITY_ADDED, { "object":_obj });
    };    

    /**
     * Remove object from the sheet
     * Note: as caller is responsible for putting object into the DOM, caller is responsible for removing it from the DOM
     * 
     * @param {String} _entityId
     * @returns {Boolean} 
     */
    this.removeEntity = function(_entityId) {
        for(let i=0; i<sheetEntities.length; i++) {
            if(sheetEntities[i].getId() === _entityId) {
                sheetEntities.splice(i, 1);
                self.refreshAllConnectors();
                refreshAllClustersInternal();
                emitEvent(SheetEvent.ENTITY_REMOVED, { "object":sheetEntities[i] });
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
     * @param {Entity} _objA 
     * @param {Entity} _objB 
     * @returns {Connector[]}
     */
    this.getConnectorsBetweenEntities = function(_entityA, _entityB) {
        const foundConnectors = [];

        objectConnectors.forEach((_conn) => {
            const aS = _conn.getAnchorStart();
            const aE = _conn.getAnchorEnd();

            if(_entityA.hasConnectorAnchor(aS) && _entityB.hasConnectorAnchor(aE)) {
                foundConnectors.push(_conn);
            }

            if(_entityA.hasConnectorAnchor(aE) && _entityB.hasConnectorAnchor(aS)) {
                foundConnectors.push(_conn);
            }            
        });

        return foundConnectors;
    };

    /**
     * 
     * @param {ConnectorAnchor} _anchorA 
     * @param {ConnectorAnchor} _anchorB 
     * @returns {Connector[]}
     */
    this.getConnectorsBetweenAnchors = function(_anchorA, _anchorB) {
        const foundConnectors = [];

        objectConnectors.forEach((_conn) => {
            const aS = _conn.getAnchorStart();
            const aE = _conn.getAnchorEnd();

            if(aS === _anchorA && aE === _anchorB) {
                foundConnectors.push(_conn);
            }

            if(aS === _anchorB && aE === _anchorA) {
                foundConnectors.push(_conn);
            }
        });

        return foundConnectors;
    };    

    /**
     * 
     * @param {Entity[]} _entitySet
     * @returns {Connector[]}
     */
    this.getConnectorsInEntitySet = function(_entitySet) {
        const foundConnectors = [];

        for(let i=0; i<_entitySet.length; i++) {
            for(let j=i+1; j<_entitySet.length; j++) {
                const connectorsBetween = self.getConnectorsBetweenEntities(_entitySet[i], _entitySet[j]);
                foundConnectors.push(...connectorsBetween);
            }
        }

        return foundConnectors;
    };

    /**
     * 
     * @param {String} _connectorId
     * @returns {Entity[]} 
     */
    this.getEntitiesConnectedViaConnector = function(_connectorId) {
        const foundEntities = [];
        const allEntities = self.getAllEntities();

        objectConnectors.forEach((_conn) => {
            if(_conn.getId() !== _connectorId) {
                return;
            }

            const aS = _conn.getAnchorStart();
            const aE = _conn.getAnchorEnd();

            allEntities.forEach((_o) => {
                if(_o.hasConnectorAnchor(aS) || _o.hasConnectorAnchor(aE)) {
                    foundEntities.push(_o);
                }
            });
        });

        return foundEntities;        
    };

    /**
     * 
     * @param {Entity} _obj
     * @returns {Connector[]} 
     */
    this.getConnectorsConnectedToEntity = function(_entity) {
        const foundConnectors = [];

        objectConnectors.forEach((_conn) => {
            const aS = _conn.getAnchorStart();
            const aE = _conn.getAnchorEnd();

            if(_entity.hasConnectorAnchor(aS) || _entity.hasConnectorAnchor(aE)) {
                foundConnectors.push(_conn);
            }

        });

        return foundConnectors;        
    };

    /**
     * @param {String} _connectorAnchorId
     * @returns {Entity|null} 
     */
    this.getEntityWithConnectorAnchor = function(_connectorAnchorId) {
        const allEntities = self.getAllEntities();
        for(let i=0; i<allEntities.length; i++) {                
            const anchors = allEntities[i].getConnectorAnchors();
            for(let j=0; j<anchors.length; j++) {
                if(anchors[j].getId() === _connectorAnchorId) {
                    return allEntities[i];
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
     * @param {Entity} _objA 
     * @param {Entity} _objB
     */
    this.findBestConnectorAnchorsToConnectEntities = function(_entityA, _entityB, _onFound) {
        bestConnectorAnchorsForEntityConnectionsFinder.findBest(_entityA, _entityB, _onFound, sheetEntities, self.getGridSize());
        metrics.findBestConnectorAnchorsToConnectEntities.batchSize = bestConnectorAnchorsForEntityConnectionsFinder.getSearchFuncBatchSize();
        metrics.findBestConnectorAnchorsToConnectEntities.searchFuncExecutionTime = bestConnectorAnchorsForEntityConnectionsFinder.getSearchFuncExecutionTime();
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
        const entitiesAroundPoint = self.getEntitiesAroundPoint(_posX, _posY);

        const eventData = {
            'targetPoint': new Point(_posX, _posY),
            'objectsAroundPoint': entitiesAroundPoint, // deprecated
            'entitiesAroundPoint': entitiesAroundPoint
        };

        emitEvent(SheetEvent.DBLCLICK, eventData);
    };

    this.initDebugMetricsPanel = function() {
        debugMetricsPanel.init();
        debugMetricsPanel.show();
    };

    /**
     * @param {Number} _dblTapSpeed
     * @param {Number} _dblTapRadius
     */
    this.initInteractionHandlers = function(_dblTapSpeed, _dblTapRadius) {
        doubleTapDetector = new DoubleTapDetector(_dblTapSpeed, _dblTapRadius);

        // dblclick on empty area of the sheet
        _sheetDomElement.addEventListener('dblclick', function (e) {

            const invTransformedPos = MatrixMath.vecMat4Multiply(
                [e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), 0, 1],
                currentInvTransformationMatrix
            );

            dblClickTapHandler(invTransformedPos[0], invTransformedPos[1]);
        });

        // click anywhere on sheet
        _sheetDomElement.addEventListener('click', function (e) {
            let sheetEntityClicked = false;
            if(e.target !== _sheetDomElement) {
                sheetEntityClicked = true;
            }

            const invTransformedPos = MatrixMath.vecMat4Multiply(
                [e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), 0, 1],
                currentInvTransformationMatrix
            );

            const eventData = {
                'targetPoint': new Point(invTransformedPos[0], invTransformedPos[1]),
                'entityClicked': sheetEntityClicked,
                'canvasObjectClicked': sheetEntityClicked // deprecated
            };
    
            emitEvent(SheetEvent.CLICK, eventData);
        });

        // touchend on sheet, logic to see if there was a double-tap
        _sheetDomElement.addEventListener('touchend', function(e) {
            const detectResult = doubleTapDetector.processTap(
                e,
                new Point(self.getOffsetLeft(), self.getOffsetTop()),
                currentInvTransformationMatrix,
            );

            if(detectResult.doubleTapDetected) {
                dblClickTapHandler(detectResult.touchX, detectResult.touchY);
            }
        });
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
        const entity = self.getEntityById(objectIdBeingDragged);
        const translateOffset = entity.getTranslateHandleOffset();
        const mx = self.snapToGrid(_x + translateOffset.getX());
        const my = self.snapToGrid(_y + translateOffset.getY());
        
        objectDragX = mx;
        objectDragY = my;		

        entity.translate(mx, my, false, Originator.USER);
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    const handleMoveEnd = function(_x, _y) {
        const entity = self.getEntityById(objectIdBeingDragged);
        const translateOffset = entity.getTranslateHandleOffset();
        const mx = self.snapToGrid(_x + translateOffset.getX());
        const my = self.snapToGrid(_y + translateOffset.getY());
        entity.translate(mx, my, false, Originator.USER);       
    };         

    /**
     * 
     * @param {Object} _e 
     */
    const handleResizeStart = function(_e) {       
        objectIdBeingResized = _e.obj.getId();
        objectResizeCursor = _e.resizeCursor;

        _sheetDomElement.style.cursor = objectResizeCursor;
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */    
    const handleResize = function(_x, _y) {
        const entity = self.getEntityById(objectIdBeingResized);

        const mx = self.snapToGrid(_x);
        const my = self.snapToGrid(_y);

        const top = entity.getY();
        const left = entity.getX();
        const newWidth = ((mx - left)+1);
        const newHeight = ((my - top)+1);

        entity.resize(newWidth, newHeight, Originator.USER);
    };

    const handleResizeEnd = function() {
        objectIdBeingResized = null;
        _sheetDomElement.style.cursor = "";
    };    

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     * @param {Element} _targetElem 
     * @returns {Boolean}
     */
    const handleMultiEntitySelectionStart = function(_x, _y, _targetElem) {
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

        const invTransformedPos = MatrixMath.vecMat4Multiply(
            [_x, _y, 0, 1],
            currentInvTransformationMatrix
        );

        multiObjectSelectionStartX = invTransformedPos[0];
        multiObjectSelectionStartY = invTransformedPos[1];
        multiObjectSelectionEndX = invTransformedPos[0];
        multiObjectSelectionEndY = invTransformedPos[1];
        multiObjectSelectionStarted = true;

        selectionBoxElem.style.left = `${multiObjectSelectionStartX}px`;
        selectionBoxElem.style.top = `${multiObjectSelectionStartY}px`;
        selectionBoxElem.style.width = `0px`;
        selectionBoxElem.style.height = `0px`;
        selectionBoxElem.style.display = "block";

        emitEvent(
            SheetEvent.MULTIPLE_ENTITY_SELECTION_STARTED,
            { 
                'x': invTransformedPos[0],
                'y': invTransformedPos[1]
            }
        );

        return true;
    };

    const handleMultiEntitySelectionEnd = function() {
        multiObjectSelectionStarted = false;

        const selectionRect = new Rectangle(
            Math.min(multiObjectSelectionStartX, multiObjectSelectionEndX), 
            Math.min(multiObjectSelectionStartY, multiObjectSelectionEndY),
            Math.max(multiObjectSelectionStartX, multiObjectSelectionEndX), 
            Math.max(multiObjectSelectionStartY, multiObjectSelectionEndY)
        );

        const selectedEntities = self.getEntitiesWithinRect(selectionRect).filter((_entity) => _entity.isAllowedWithinMultiEntitySelection() );
        const boundingRect = self.calcBoundingRectForEntities(selectedEntities);

        selectionBoxElem.style.left = `${boundingRect.getLeft()}px`;
        selectionBoxElem.style.top = `${boundingRect.getTop()}px`;
        selectionBoxElem.style.width = `${boundingRect.getWidth()}px`;
        selectionBoxElem.style.height = `${boundingRect.getHeight()}px`;
        selectionBoxElem.style.display = "none";

        emitEvent(
            SheetEvent.MULTIPLE_ENTITIES_SELECTED, 
            { 
                'selectedObjects': selectedEntities, // deprecated
                'selectedEntities': selectedEntities,
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

        const invTransformedPos = MatrixMath.vecMat4Multiply(
            [_endX, _endY, 0, 1],
            currentInvTransformationMatrix
        );

        multiObjectSelectionEndX = invTransformedPos[0];
        multiObjectSelectionEndY = invTransformedPos[1];
        const width = multiObjectSelectionEndX - multiObjectSelectionStartX;
        const height = multiObjectSelectionEndY - multiObjectSelectionStartY;

        if(width >= 0) {
            selectionBoxElem.style.width = `${width}px`;
        } else {
            selectionBoxElem.style.left = `${invTransformedPos[0]}px`;
            selectionBoxElem.style.width = `${Math.abs(width)}px`;
        }

        if(height >= 0) {
            selectionBoxElem.style.height = `${height}px`;
        } else {
            selectionBoxElem.style.top = `${invTransformedPos[1]}px`;
            selectionBoxElem.style.height = `${Math.abs(height)}px`;
        }
    };

    /**
     * Create the selection box element that's shown when the user drag to select entities
     * 
     * @param {String[]} _selectionRectStyleCssClasses 
     * @returns {Element}
     */
    const createSelectionBoxElement = function(_selectionRectStyleCssClasses) {
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

        return  _sheetDomElement.appendChild(selBox);
    };

    /**
     * @param {String[]} _selectionRectStyleCssClasses
     */
    this.initMultiEntitySelectionHandler = function(_selectionRectStyleCssClasses) {
        selectionBoxElem = createSelectionBoxElement(_selectionRectStyleCssClasses);

        const handleTouchSelectionStart = function(e) {
            const hasSelectionStarted = handleMultiEntitySelectionStart(e.touches[0].pageX - self.getOffsetLeft(), e.touches[0].pageY - self.getOffsetTop(), e.target);
        };

        _sheetDomElement.addEventListener('mousedown', function(e) {
            if (e.which !== 1) {
                return;
            }

            const hasSelectionStarted = handleMultiEntitySelectionStart(e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), e.target);
            if(hasSelectionStarted) {
                e.preventDefault(); // prevents text selection from triggering
            }
        });

        _sheetDomElement.addEventListener('touchstart', function(e) {
            touchHoldStartInterval = setInterval(function() {
                handleTouchSelectionStart(e);
            }, touchHoldDelayTimeMs);
        });

        _sheetDomElement.addEventListener('touchend', function(e) {
            clearInterval(touchHoldStartInterval);
        });

        _sheetDomElement.addEventListener('touchmove', function(e) {
            clearInterval(touchHoldStartInterval);
        });        
    };

    this.initTransformationHandlers = function() {
        _sheetDomElement.addEventListener('touchstart', function(e) {
            touchMoveLastX = e.touches[0].pageX - self.getOffsetLeft();
            touchMoveLastY = e.touches[0].pageY - self.getOffsetTop();
        });

        _sheetDomElement.addEventListener('touchmove', function (e) {
            if (objectIdBeingDragged !== null) {
                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.touches[0].pageX - self.getOffsetLeft(), e.touches[0].pageY - self.getOffsetTop(), 0, 1],
                    currentInvTransformationMatrix
                );                    

                handleMove(invTransformedPos[0], invTransformedPos[1]);
                // if we're transforming an object, make sure we don't scroll the sheet
                e.preventDefault();
            }

            if(objectIdBeingResized !== null) {
                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.touches[0].pageX - self.getOffsetLeft(), e.touches[0].pageY - self.getOffsetTop(), 0, 1],
                    currentInvTransformationMatrix
                );     

                handleResize(invTransformedPos[0], invTransformedPos[1]);
                e.preventDefault();
            }

            if(multiObjectSelectionStarted) {
                updateSelectionBoxEndPoint(e.touches[0].pageX - self.getOffsetLeft(), e.touches[0].pageY - self.getOffsetTop());
                e.preventDefault();
            }

            touchMoveLastX = e.touches[0].pageX - self.getOffsetLeft();
            touchMoveLastY = e.touches[0].pageY - self.getOffsetTop();
        });

        _sheetDomElement.addEventListener('mousemove', function (e) {
            if (objectIdBeingDragged !== null) {		
                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), 0, 1],
                    currentInvTransformationMatrix
                );                    

                handleMove(invTransformedPos[0], invTransformedPos[1]);
            }

            if(objectIdBeingResized !== null) {
                const invTransformedPos = MatrixMath.vecMat4Multiply(
                    [e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), 0, 1],
                    currentInvTransformationMatrix
                );     

                handleResize(invTransformedPos[0], invTransformedPos[1]);
            }

            if(multiObjectSelectionStarted) {
                updateSelectionBoxEndPoint(e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop());
            }
        });

        _sheetDomElement.addEventListener('touchend', function (e) {

            // e.touches is empty..
            // Need to use e.changedTouches for final x,y ???

            if(objectIdBeingDragged !== null) {
                objectIdBeingDragged = null;
            }           
            
            if(objectIdBeingResized !== null) {
                handleResizeEnd();
            } 

            if(multiObjectSelectionStarted) {
                handleMultiEntitySelectionEnd();
            }
        });

        _sheetDomElement.addEventListener('mouseup', function (e) {
            if (e.which === 1) {
                if(objectIdBeingDragged !== null) {

                    const invTransformedPos = MatrixMath.vecMat4Multiply(
                        [e.pageX - self.getOffsetLeft(), e.pageY - self.getOffsetTop(), 0, 1],
                        currentInvTransformationMatrix
                    );

                    handleMoveEnd(invTransformedPos[0], invTransformedPos[1]);
                }

                if(objectIdBeingResized !== null) {
                    handleResizeEnd();
                }

                if(multiObjectSelectionStarted) {
                    handleMultiEntitySelectionEnd();
                }

                objectIdBeingDragged = null;
                objectIdBeingResized = null;
            }
        });

        _sheetDomElement.addEventListener('mousedown', function (e) {
            // if we're dragging something, stop propagation
            if(objectIdBeingDragged !== null || objectIdBeingResized !== null) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };

    /**
     * 
     * @param {String} _eventName 
     * @param {String} _eventData 
     */
    const emitEvent = function(_eventName, _eventData) {
        const allCallbacks = eventHandlers.get(_eventName) || [];

        for(let i=0; i<allCallbacks.length; i++) {
            const cbFunc = allCallbacks[i];
            cbFunc(_eventData);
        }
    };

    /**
     * 
     * @param {String} _eventName 
     * @param {SheetEventCallback} _callback 
     */
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

    /**
     * 
     * @param {String} _eventName 
     * @param {SheetEventCallback} _callback 
     */
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

export { Sheet };
