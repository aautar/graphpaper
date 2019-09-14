/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Point(_x, _y) {
    this.__x = _x;
    this.__y = _y;
};

/**
 * @returns {Number}
 */     
Point.prototype.getX = function() {
    return this.__x;
};

/**
 * @returns {Number}
 */     
Point.prototype.getY = function() {
    return this.__y;
};

/**
 * @param {Point} _otherPoint
 * @returns {Boolean}
 */
Point.prototype.isEqual = function(_otherPoint) {
    if(this.__x === _otherPoint.getX() && this.__y === _otherPoint.getY()) {
        return true;
    }

    return false;
};

/**
 * @returns {Point}
 */
Point.prototype.getCartesianPoint = function(_canvasWidth, _canvasHeight) {
    return new Point(
        this.__x - (_canvasWidth * 0.5),
        -this.__y + (_canvasHeight * 0.5)
    );
};

/**
 * @returns {String}
 */
Point.prototype.toString = function() {
    return this.__x + " " + this.__y;
};

/**
 * @returns {Number[]}
 */
Point.prototype.toArray = function() {
    return [this.__x, this.__y];
};

/**
 * @param {Number[]} _arr
 * @returns {Point}
 */
Point.fromArray = function(_arr) {
    return new Point(_arr[0], _arr[1]);
};

export { Point };
