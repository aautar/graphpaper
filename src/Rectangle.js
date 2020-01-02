import {Point} from './Point';
import {Line} from './Line';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {Number} _left
 * @param {Number} _top
 * @param {Number} _right
 * @param {Number} _bottom
 */
function Rectangle(_left, _top, _right, _bottom)  {
    
    const self=this;

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
     * @returns {Number}
     */    
    this.getWidth = function() {
        return _right - _left;
    };

    /**
     * @returns {Number}
     */    
    this.getHeight = function() {
        return _bottom - _top;
    };

    /**
     * @returns {Point[]}
     */
    this.getPoints = function() {
        return [
            new Point(_left, _top),
            new Point(_right, _top),
            new Point(_right, _bottom),
            new Point(_left, _bottom)
        ];
    };

    /**
     * @returns {Line[]}
     */
    this.getLines = function() {
        return [
            new Line(new Point(_left, _top), new Point(_right, _top)),
            new Line(new Point(_right, _top), new Point(_right, _bottom)),
            new Line(new Point(_right, _bottom), new Point(_left, _bottom)),
            new Line(new Point(_left, _bottom), new Point(_left, _top))
        ];
    };

    /**
     * @param {Number} _resizeByPx
     * @returns {Rectangle}
     */
    this.getUniformlyResizedCopy = function(_resizeByPx) {
        return new Rectangle(
            _left - _resizeByPx, 
            _top - _resizeByPx, 
            _right + _resizeByPx, 
            _bottom + _resizeByPx
        );
    };

    /**
     * Scale the bounding box by _gridSize, and return the points comprising the box
     * 
     * @param {Number} _gridSize
     * @returns {Point[]}
     */
    this.getPointsScaledToGrid = function(_gridSize) {

        const centroid = new Point(
            _left + ((_right-_left)*0.5),
            _top + ((_bottom-_top)*0.5)
        );

        const scaleDx = ((_right - centroid.getX()) + _gridSize) / (_right - centroid.getX());
        const scaleDy = ((_bottom - centroid.getY()) + _gridSize) / (_bottom - centroid.getY());        
       
        const scaledPoints = [
            new Point(
                ((_left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_top - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_right - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_bottom - centroid.getY())*scaleDy) + centroid.getY()
            ),

            new Point(
                ((_left - centroid.getX())*scaleDx) + centroid.getX(), 
                ((_bottom - centroid.getY())*scaleDy) + centroid.getY()
            )
        ];

        return scaledPoints;
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
     * @param {Point} _point 
     */
    this.checkIsPointWithin = function(_point) {
        if(_point.getX() >= _left && _point.getX() <= _right && _point.getY() >= _top && _point.getY() <= _bottom) {
            return true;
        }

        return false;
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
