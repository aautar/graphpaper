(function (exports) {
'use strict';

/**
 * 
 * @param {Number} _width
 * @param {Number} _height
 */
function Dimensions(_width, _height) {
    this.getWidth = function() {
        return _width;
    };

    this.getHeight = function() {
        return _height;
    };
}

/**
 * 
 * @param {Number} _left
 * @param {Number} _top
 * @param {Number} _right
 * @param {Number} _bottom
 */
function Rectangle(_left, _top, _right, _bottom)  {
    
    /**
     * @returns {Number}
     */
    this.getLeft = function() {
        return _left;
    };

    /**
     * @returns {Number}
     */
    this.getTop = function() {
        return _top;
    };

    /**
     * @returns {Number}
     */
    this.getRight = function() {
        return _right;
    };

    /**
     * @returns {Number}
     */
    this.getBottom = function() {
        return _bottom;
    };

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    this.checkIntersect = function(_otherRectangle) {
        if(_bottom < _otherRectangle.getTop()) {
            return false;
        }

        if(_top > _otherRectangle.getBottom()) {
            return false;
        }

        if(_right < _otherRectangle.getLeft()) {
            return false;
        }

        if(_left > _otherRectangle.getRight()) {
            return false;
        }

        return true;
    };

    /**
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    this.checkIsWithin = function(_otherRectangle) {
        if( _bottom <= _otherRectangle.getBottom() &&
            _top >= _otherRectangle.getTop() &&
            _right <= _otherRectangle.getRight() &&
            _left >= _otherRectangle.getLeft()
        ) {

            return true;
        }

        return false;
    };
}

/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {
    this.getX = function() {
        return _x;
    };

    this.getY = function() {
        return _y;
    };
}

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
}

exports.Dimensions = Dimensions;
exports.Rectangle = Rectangle;
exports.Point = Point;
exports.Object = Object;

}((this.GraphPaper = this.GraphPaper || {})));
