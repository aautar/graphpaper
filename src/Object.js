import {Point} from './Point';
import  {Rectangle} from './Rectangle';

/**
 * 
 * @param {String} _id
 * @param {Number} _x
 * @param {Number} _y
 * @param {Number} _width
 * @param {Number} _height
 */
function Object(_id, _x, _y, _width, _height, _domElement) {

    var self = this;

    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
    this.domElement = _domElement;
    this.isDeleted = false;
    this.touchInternalContactPt = null;

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
     * @returns {Number}
     */
    this.getY = function() {
        return self.y;
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
     * @returns {Boolean}
     */
    this.isDeleted = function() {
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
    this.handleParentCanvasInteraction = function(_eventName, _eventData) { 

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
};

export { Object };
