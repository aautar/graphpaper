/**
 * 
 * @param {Number} _width
 * @param {Number} _height
 */
function Dimensions(_width, _height) {

    /**
     * @returns {Number}
     */       
    this.getWidth = function() {
        return _width;
    };

    /**
     * @returns {Number}
     */       
    this.getHeight = function() {
        return _height;
    };
};

export { Dimensions };
