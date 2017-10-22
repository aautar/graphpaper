const GRID_STYLE = {
    LINE: 'line',
    DOT: 'dot'
};

/**
 * 
 * @param {Number} _size
 * @param {String} _color
 * @param {String} _style
 */
function Grid(_size, _color, _style) {

    /**
     * @returns {Number}
     */
    this.getSize = function() {
        return _size;
    };

    /**
     * @returns {String}
     */
    this.getStyle = function() {
        return _style;
    };

    /**
     * @returns {String}
     */
    this.getSvgImageTile = function() {
        if(_style === GRID_STYLE.LINE) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + _size + '" height="' + _size + '"><rect width="12" height="1" x="0" y="11" style="fill:' + _color + '" /><rect width="1" height="12" x="11" y="0" style="fill:' + _color + '" /></svg>';
        } else {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + _size + '" height="' + _size + '"><rect width="1" height="1" x="11" y="11" style="fill:' + _color + '" /></svg>';
        }
    };

};
    
export { GRID_STYLE, Grid };
