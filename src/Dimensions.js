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
};

export { Dimensions };
