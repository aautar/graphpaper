/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {

    /**
     * @returns {Number}
     */       
    this.getX = function() {
        return _x;
    };

    /**
     * @returns {Number}
     */       
    this.getY = function() {
        return _y;
    };

    /**
     * @param {Point} _otherPoint
     * @returns {Boolean}
     */
    this.isEqual = function(_otherPoint) {
        if(_x === _otherPoint.getX() && _y === _otherPoint.getY()) {
            return true;
        }

        return false;
    };

    /**
     * @returns {Point}
     */
    this.getCartesianPoint = function(_canvasWidth, _canvasHeight) {
        return new Point(
            _x - (_canvasWidth * 0.5),
            -_y + (_canvasHeight * 0.5)
        );
    };
};

export { Point };
