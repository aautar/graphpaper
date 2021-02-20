import {Point} from './Point';

/**
 * 
 * @param {Number} _x
 * @param {Number} _y
 */
function Vec2(_x, _y) {
    this.__x = _x;
    this.__y = _y;
};

Vec2.prototype = Object.create(Point.prototype, {});

Vec2.prototype.normalize = function() {
    const len = Math.sqrt((this.__x * this.__x) + (this.__y * this.__y));
    if(len === 0) {
        return this;
    }

    this.__x = this.__x / len;
    this.__y = this.__y / len;
    return this;
};

Vec2.prototype.dot = function(_v) {
    return ((this.__x * _v.getX()) + (this.__y * _v.getY()));
};

export {Vec2}
