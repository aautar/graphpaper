import {Point} from './Point';
import  {Rectangle} from './Rectangle';
import  {Canvas} from './Canvas';

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
function Object(_id, _x, _y, _width, _height, _canvas, _domElement, _translateHandleDomElement, _resizeHandleDomElement) {

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
    }

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
};

export { Object };
