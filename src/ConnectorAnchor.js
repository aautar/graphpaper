/**
 * 
 * @param {String} _objectId 
 * @param {Number} _x
 * @param {Number} _y
 * @param {Element} _domElement
 */
function ConnectorAnchor(_objectId, _x, _y, _domElement) {
    
    /**
     * @returns {String}
     */
    this.getObjectId = function() {
        return _objectId;
    };

    /**
     * @returns {Number}
     */    
    this.getX = function() {
        return x;
    };

    /**
     * @returns {Number}
     */        
    this.getY = function() {
        return y;
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };
};

export { ConnectorAnchor };
