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
     * 
     * @param {Rectangle} _otherRectangle
     * @returns {Boolean}
     */
    this.checkIntersect = function(_otherRectangle) {
        if(_bottom < _otherRectangle.top) {
            return false;
        }

        if(_top > _otherRectangle.bottom) {
            return false;
        }

        if(_right < _otherRectangle.left) {
            return false;
        }

        if(_left > _otherRectangle.right) {
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
        if( _bottom <= _otherRectangle.bottom &&
            _top >= _otherRectangle.top &&
            _right <= _otherRectangle.right &&
            _left >= _otherRectangle.left
        ) {

            return true;
        }

        return false;
    };
}

exports.Dimensions = Dimensions;
exports.Rectangle = Rectangle;

}((this.GraphPaper = this.GraphPaper || {})));
