import {Point} from './Point';
import {Rectangle} from './Rectangle';
import {Canvas} from './Canvas';
import {ConnectorAnchor} from './ConnectorAnchor';

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

    const self = this;

    const MOUSE_MIDDLE_BUTTON = 1;

    /**
     * @type {ConnectorAnchor[]}
     */
    const connectorAnchors = [];

    var nextConnectorAnchorIdSuffix = 1000;

    this.x = parseInt(_x);
    this.y = parseInt(_y);
    this.width = parseInt(_width);
    this.height = parseInt(_height);
    this.isDeleted = false;

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

        const objBoundingRectange = self.getBoundingRectange();

        const allRoutingPoints = [];
        connectorAnchors.forEach(function(_anchor) {
            const anchorPoints = _anchor.getRoutingPoints(_gridSize);
            anchorPoints.forEach(function(_pt) {
                if(!objBoundingRectange.checkIsPointWithin(_pt)) {
                    allRoutingPoints.push(_pt);
                }
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
     * @returns {Number}
     */    
    this.getTranslateHandleOffsetX = function() {
        return -(_translateHandleDomElement.offsetLeft + _translateHandleDomElement.offsetWidth * 0.5);
    };

    /**
     * @returns {Number}
     */    
    this.getTranslateHandleOffsetY = function() {
        return -(_translateHandleDomElement.offsetTop  + _translateHandleDomElement.offsetHeight * 0.5);
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

        _domElement.style.left = parseInt(self.x) + 'px';
        _domElement.style.top = parseInt(self.y) + 'px';
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

        _domElement.style.width = parseInt(self.width) + 'px';
        _domElement.style.height = parseInt(self.height) + 'px';
    }

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
        const left = parseInt(self.x);
        const top = parseInt(self.y);
        const right = left + parseInt(self.width);
        const bottom = top + parseInt(self.height);

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
     * @param {CanvasObject} _obj 
     * @param {Number} _x 
     * @param {Number} _y 
     * @param {Boolean} _isTouchMove 
     */
    var moveStart = function(_obj, _x, _y, _isTouchMove) {

    };

    /**
     * 
     * @param {CanvasObject} _obj 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    var resizeStart = function(_obj, _x, _y) {

    };

    /**
     * 
     * @param {*} _moveStartFunc 
     */
    this.setMoveStartCallback = function(_moveStartFunc) {
        moveStart = _moveStartFunc;
    }; 

    /**
     * 
     * @param {*} _moveStartFunc 
     */
    this.setResizeStartCallback = function(_resizeStartFunc) {
        resizeStart = _resizeStartFunc;
    }; 
    

    _translateHandleDomElement.addEventListener('touchstart', function(e) {
        moveStart(self, e.touches[0].pageX, e.touches[0].pageY, true);
    });

    _translateHandleDomElement.addEventListener('mousedown', function (e) {
        moveStart(self, e.pageX, e.pageY, false);
    });

    _resizeHandleDomElement.addEventListener('mousedown', function (e) {
        if (e.which !== MOUSE_MIDDLE_BUTTON) {
            return;
        }

        resizeStart(self, e.pageX, e.pageY);
    });    
};

export { CanvasObject };
