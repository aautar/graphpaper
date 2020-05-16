import {Point} from './Point';
import {Rectangle} from './Rectangle';
import {Sheet} from './Sheet';
import {ConnectorAnchor} from './ConnectorAnchor';

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
        const newAnchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _sheet);
        connectorAnchors.push(newAnchor);
        nextConnectorAnchorIdSuffix++;
        return newAnchor;
    };

    /**
     * @param {Element} _connectorAnchorDomElement
     * @returns {ConnectorAnchor}
     */    
    this.addInteractableConnectorAnchor = function(_connectorAnchorDomElement) {     
        const anchor = new ConnectorAnchor(_id + `-${nextConnectorAnchorIdSuffix}`, _connectorAnchorDomElement, _sheet);

        _connectorAnchorDomElement.addEventListener('click', function(e) {
            _sheet.addConnectionAnchorToSelectionStack(anchor);
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
     * @returns {Point}
     */
    this.getPositionOnPage = function() {
        const window = _domElement.ownerDocument.defaultView;
        const boundingRect = _domElement.getBoundingClientRect();
        return new Point(boundingRect.left + window.scrollX, boundingRect.top + window.scrollY);
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
};

export { Entity };
