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
};

export { Point };
