import {EntityEvent} from './EntityEvent';
import {Point} from './Point';
import {Rectangle} from './Rectangle';
import {Sheet} from './Sheet';
import {ConnectorAnchor} from './ConnectorAnchor';
import {PointSet} from './PointSet';
import {Originator} from './Originator';

/**
 * 
 * @param {String} _id
 * @param {Number} _x
 * @param {Number} _y
 * @param {Number} _width
 * @param {Number} _height
 * @param {Sheet} _sheet
 * @param {Element} _domElement
 * @param {Element[]} _translateHandleDomElements
 * @param {Element[]} _resizeHandleDomElements
 */
function Entity(_id, _x, _y, _width, _height, _sheet, _domElement, _translateHandleDomElements, _resizeHandleDomElements) {
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

    /**
     * @type {Map<String, Function>}
     */
    const eventNameToHandlerFunc = new Map();

    /**
     * @type {Entity[]}
     */
    const subEntities = [];

    let x = null;
    let y = null;
    let width = null;
    let height = null;
    let hasPendingFrame = false;
    let overwrittenRenderStyles = {};

    /**
     * @param {Element} _connectorAnchorDomElement
     * @param {Number} _routingPointOffsetX
     * @param {Number} _routingPointOffsetY
     * @returns {ConnectorAnchor}
     */    
    this.addNonInteractableConnectorAnchor = function(_connectorAnchorDomElement, _routingPointOffsetX, _routingPointOffsetY) {
        const newAnchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _sheet, _routingPointOffsetX, _routingPointOffsetY);
        connectorAnchors.push(newAnchor);
        nextConnectorAnchorIdSuffix++;
        return newAnchor;
    };

    /**
     * @param {Element} _connectorAnchorDomElement
     * @param {Number} _routingPointOffsetX
     * @param {Number} _routingPointOffsetY 
     * @returns {ConnectorAnchor}
     */    
    this.addInteractableConnectorAnchor = function(_connectorAnchorDomElement, _routingPointOffsetX, _routingPointOffsetY) {     
        const anchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _sheet, _routingPointOffsetX, _routingPointOffsetY);

        _connectorAnchorDomElement.addEventListener('click', function(e) {
            _sheet.addConnectionAnchorToSelectionStack(anchor);
        });

        connectorAnchors.push(anchor);
        nextConnectorAnchorIdSuffix++;
        return anchor;
    };

    /**
     * 
     * @returns {Point[]}
     */
    this.getConnectorAnchorRoutingPoints = function() {
        const allRoutingPoints = [];
        connectorAnchors.forEach(function(_anchor) {
            const anchorPoints = _anchor.getRoutingPoints();
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
     * @returns {Point}
     */
    this.getPositionOnPage = function() {
        const window = _domElement.ownerDocument.defaultView;
        const boundingRect = _domElement.getBoundingClientRect();
        return new Point(boundingRect.left + window.scrollX, boundingRect.top + window.scrollY);
    };

    this.renderImmediate = function() {
        if(overwrittenRenderStyles.left) {
            _domElement.style.left = overwrittenRenderStyles.left;
        } else {
            _domElement.style.left = x + 'px';
        }

        if(overwrittenRenderStyles.top) {
            _domElement.style.top = overwrittenRenderStyles.top;
        } else {
            _domElement.style.top = y + 'px';
        }

        if(overwrittenRenderStyles.width) {
            _domElement.style.width = overwrittenRenderStyles.width;
        } else {
            _domElement.style.width = width + 'px';
        }

        if(overwrittenRenderStyles.height) {
            _domElement.style.height = overwrittenRenderStyles.height;
        } else {
            _domElement.style.height = height + 'px';
        }
        
        hasPendingFrame = false;
    };

    this.render = function() {
        if(hasPendingFrame) {
            cancelAnimationFrame(self.renderImmediate);
        }

        hasPendingFrame = true;
        requestAnimationFrame(self.renderImmediate);
    };

    /**
     * 
     * @param {String} _style 
     * @param {String} _value 
     */
    this.overwriteRenderStyle = function(_style, _value) {
        overwrittenRenderStyles[_style] = _value;
    };

    /**
     * @param {Number} _x
     * @param {Number} _y
     * @param {Boolean} [_withinGroupTransformation=false]
     * @param {Originator} [_originator=Originator.PROGRAM]
     */
    this.translate = function(_x, _y, _withinGroupTransformation, _originator) {
        if(_x === x && _y === y) {
            return;
        }

        const dx = _x - x;
        const dy = _y - y;
        const originator = _originator ? _originator : Originator.PROGRAM;

        x = _x;
        y = _y;

        self.render();

        const observers = eventNameToHandlerFunc.get(EntityEvent.TRANSLATE) || [];
        observers.forEach(function(handler) {
            handler(
                {
                    "obj": self, 
                    "x": _x, 
                    "y": _y,
                    "withinGroupTransformation": _withinGroupTransformation ? true : false,
                    "originator": originator,
                }
            );
        });

        const originatorForSubEntities = (_originator === Originator.USER) ? Originator.USER_VIA_PARENT_ENTITY : Originator.PROGRAM_VIA_PARENT_ENTITY; 
        subEntities.forEach((_subEntity) => {
            _subEntity.translate(
                _subEntity.getX() + dx, 
                _subEntity.getY() + dy, 
                false, 
                originatorForSubEntities,
            );
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
     * @param {Originator} [_source=Originator.PROGRAM]
     */
    this.resize = function(_width, _height, _originator) {            
        width = _width;
        height = _height;

        self.render();

        const observers = eventNameToHandlerFunc.get(EntityEvent.RESIZE) || [];
        observers.forEach(function(handler) {
            handler(
                {
                    "obj": self, 
                    "width": _width, 
                    "height": _height,
                    "originator": _originator ? _originator : Originator.PROGRAM,
                }
            );
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
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRectangeInPageSpace = function() {
        const pagePos = self.getPositionOnPage();
        const left = pagePos.getX();
        const top = pagePos.getY();
        const right = left + width;
        const bottom = top + height;
        return new Rectangle(left, top, right, bottom);
    };

    /**
     * 
     * @param {Rectangle} _rectInPageSpace
     * @returns {Rectangle}
     */
    this.computePageToEntitySpaceTransformedRectangle = function(_rectInPageSpace) {
        const noteBoundingRect = self.getBoundingRectangeInPageSpace();
        const rectRelativeToNote = new GraphPaper.Rectangle(
            _rectInPageSpace.getLeft() - noteBoundingRect.getLeft(),
            _rectInPageSpace.getTop() - noteBoundingRect.getTop(),
            _rectInPageSpace.getRight() - noteBoundingRect.getRight(),
            _rectInPageSpace.getBottom() - noteBoundingRect.getBottom()
        );

        return rectRelativeToNote;
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
     * @returns {Object}
     */
    this.getDescriptor = function() {
        let outerBoundMinX = self.getX();
        let outerBoundMinY = self.getY();
        let outerBoundMaxX = self.getX() + self.getWidth();
        let outerBoundMaxY = self.getY() + self.getHeight();

        const anchors = [];
        for(let i=0; i<connectorAnchors.length; i++) {
            const boundingRect = connectorAnchors[i].getBoundingRectange();
            let routingPoints = new PointSet(connectorAnchors[i].getRoutingPoints());
            anchors.push(
                {
                    "id": connectorAnchors[i].getId(),
                    "x": boundingRect.getLeft(),
                    "y": boundingRect.getTop(),
                    "width": boundingRect.getWidth(),
                    "height": boundingRect.getHeight(),
                    "routingPointsFloat64Arr": routingPoints.toFloat64Array()
                }
            );

            if(boundingRect.getLeft() < outerBoundMinX) {
                outerBoundMinX = boundingRect.getLeft();
            }

            if(boundingRect.getTop() < outerBoundMinY) {
                outerBoundMinY = boundingRect.getTop();
            }

            if((boundingRect.getLeft() + boundingRect.getWidth()) > outerBoundMaxX) {
                outerBoundMaxX = (boundingRect.getLeft() + boundingRect.getWidth());
            }

            if((boundingRect.getTop() + boundingRect.getHeight()) > outerBoundMaxY) {
                outerBoundMaxY = (boundingRect.getTop() + boundingRect.getHeight());
            }
        }

        return {
            "id": self.getId(),
            "x": self.getX(),
            "y": self.getY(),
            "width": self.getWidth(),
            "height": self.getHeight(),
            "connectorAnchors": anchors,
            "outerBoundingRect": {
                "minX": outerBoundMinX,
                "minY": outerBoundMinY,
                "maxX": outerBoundMaxX,
                "maxY": outerBoundMaxY
            }
        }
    };

    /**
     * Attach sub-entities which will translate relative to this entity, when a translate transform occurs
     * 
     * @param {Entity[]} _subEntities 
     */
    this.attachSubEntities = function(_subEntities) {
        subEntities.push(..._subEntities);
    };

    /**
     * 
     * @returns {Entity[]}
     */
    this.getAttachedSubEntities = function() {
        return subEntities;
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

        const observers = eventNameToHandlerFunc.get(EntityEvent.TRANSLATE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "obj": self,
                "x": e.touches[0].pageX, 
                "y": e.touches[0].pageY,
                "isTouch": true,
                "originator": Originator.USER,
            });
        });        

    };

    const translateMouseDownHandler = function(e) {
        currentTranslateHandleElementActivated = e.target;
        
        const observers = eventNameToHandlerFunc.get(EntityEvent.TRANSLATE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "obj": self,
                "x": e.pageX, 
                "y": e.pageY,
                "isTouch": false,
                "originator": Originator.USER,
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

    const resizeMouseDownHandler = function(_e, _triggeredByElement, _resizeCursor) {
        if (_e.which !== MOUSE_MIDDLE_BUTTON) {
            return;
        }

        currentResizeHandleElementActivated = _triggeredByElement;
        
        const observers = eventNameToHandlerFunc.get(EntityEvent.RESIZE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "obj": self,
                "x": _e.pageX, 
                "y": _e.pageY,
                "resizeCursor": _resizeCursor,
                "isTouch": false,
                "originator": Originator.USER,
            });
        });    
    };

    const resizeTouchStartHandler = function(_e, _triggeredByElement, _resizeCursor) {
        currentResizeHandleElementActivated =_triggeredByElement;
        
        const observers = eventNameToHandlerFunc.get(EntityEvent.RESIZE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "obj": self,
                "x": _e.touches[0].pageX,  
                "y": _e.touches[0].pageY,
                "resizeCursor": _resizeCursor,
                "isTouch": true,
                "originator": Originator.USER,
            });
        });
    };

    const bindResizeHandleElements = function() {
        _resizeHandleDomElements.forEach((_el) => {
            const cursor = window.getComputedStyle(_el)['cursor'];

            _el.addEventListener('touchstart', (e) => {
                resizeTouchStartHandler(e, _el, cursor);
            });

            _el.addEventListener('mousedown', (e) => {
                resizeMouseDownHandler(e, _el, cursor);
            });  
        });
    };


    bindTranslateHandleElements();
    bindResizeHandleElements();
    self.translate(_x, _y, false, Originator.PROGRAM);
    self.resize(_width, _height, Originator.PROGRAM);
};

export { Entity };
