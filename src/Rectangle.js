
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
};

export { Rectangle }
