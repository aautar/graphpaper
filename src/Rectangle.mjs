import {Point} from './Point';
import {Line} from './Line';

/**
 * 
 * @param {Number} _left
 * @param {Number} _top
 * @param {Number} _right
 * @param {Number} _bottom
 */
function Rectangle(_left, _top, _right, _bottom)  {
    this.__left = _left;
    this.__top = _top;
    this.__right = _right;
    this.__bottom = _bottom;    
};


/**
 * @returns {Number}
 */
Rectangle.prototype.getLeft = function() {
    return this.__left;
};

/**
 * @returns {Number}
 */
Rectangle.prototype.getTop = function() {
    return this.__top;
};

/**
 * @returns {Number}
 */
Rectangle.prototype.getRight = function() {
    return this.__right;
};

/**
 * @returns {Number}
 */
Rectangle.prototype.getBottom = function() {
    return this.__bottom;
};

/**
 * @returns {Number}
 */    
Rectangle.prototype.getWidth = function() {
    return this.__right - this.__left;
};

/**
 * @returns {Number}
 */    
Rectangle.prototype.getHeight = function() {
    return this.__bottom - this.__top;
};

/**
 * @returns {Point[]}
 */
Rectangle.prototype.getPoints = function() {
    return [
        new Point(this.__left, this.__top),
        new Point(this.__right, this.__top),
        new Point(this.__right, this.__bottom),
        new Point(this.__left, this.__bottom)
    ];
};

/**
 * @returns {Line[]}
 */
Rectangle.prototype.getLines = function() {
    return [
        new Line(new Point(this.__left, this.__top), new Point(this.__right, this.__top)),
        new Line(new Point(this.__right, this.__top), new Point(this.__right, this.__bottom)),
        new Line(new Point(this.__right, this.__bottom), new Point(this.__left, this.__bottom)),
        new Line(new Point(this.__left, this.__bottom), new Point(this.__left, this.__top))
    ];
};

/**
 * @param {Number} _resizeByPx
 * @returns {Rectangle}
 */
Rectangle.prototype.getUniformlyResizedCopy = function(_resizeByPx) {
    return new Rectangle(
        this.__left - _resizeByPx, 
        this.__top - _resizeByPx, 
        this.__right + _resizeByPx, 
        this.__bottom + _resizeByPx
    );
};

/**
 * Scale the bounding box by _gridSize, and return the points comprising the box
 * 
 * @param {Number} _gridSize
 * @returns {Point[]}
 */
Rectangle.prototype.getPointsScaledToGrid = function(_gridSize) {

    const centroid = new Point(
        this.__left + ((this.__right-this.__left)*0.5),
        this.__top + ((this.__bottom-this.__top)*0.5)
    );

    const scaleDx = ((this.__right - centroid.getX()) + _gridSize) / (this.__right - centroid.getX());
    const scaleDy = ((this.__bottom - centroid.getY()) + _gridSize) / (this.__bottom - centroid.getY());        

    const scaledPoints = [
        new Point(
            ((this.__left - centroid.getX())*scaleDx) + centroid.getX(), 
            ((this.__top - centroid.getY())*scaleDy) + centroid.getY()
        ),

        new Point(
            ((this.__right - centroid.getX())*scaleDx) + centroid.getX(), 
            ((this.__top - centroid.getY())*scaleDy) + centroid.getY()
        ),

        new Point(
            ((this.__right - centroid.getX())*scaleDx) + centroid.getX(), 
            ((this.__bottom - centroid.getY())*scaleDy) + centroid.getY()
        ),

        new Point(
            ((this.__left - centroid.getX())*scaleDx) + centroid.getX(), 
            ((this.__bottom - centroid.getY())*scaleDy) + centroid.getY()
        )
    ];

    return scaledPoints;
};    

/**
 * 
 * @param {Rectangle} _otherRectangle
 * @returns {Boolean}
 */
Rectangle.prototype.checkIntersect = function(_otherRectangle) {
    if(this.__bottom < _otherRectangle.getTop()) {
        return false;
    }

    if(this.__top > _otherRectangle.getBottom()) {
        return false;
    }

    if(this.__right < _otherRectangle.getLeft()) {
        return false;
    }

    if(this.__left > _otherRectangle.getRight()) {
        return false;
    }

    return true;
};


/**
 * 
 * @param {Point} _point 
 */
Rectangle.prototype.checkIsPointWithin = function(_point) {
    if(_point.getX() >= this.__left && _point.getX() <= this.__right && _point.getY() >= this.__top && _point.getY() <= this.__bottom) {
        return true;
    }

    return false;
};

/**
 * 
 * @param {Rectangle} _otherRectangle
 * @returns {Boolean}
 */
Rectangle.prototype.checkIsWithin = function(_otherRectangle) {
    if( this.__bottom <= _otherRectangle.getBottom() &&
        this.__top >= _otherRectangle.getTop() &&
        this.__right <= _otherRectangle.getRight() &&
        this.__left >= _otherRectangle.getLeft()
    ) {

        return true;
    }

    return false;
};


export { Rectangle }
