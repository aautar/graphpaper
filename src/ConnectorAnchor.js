/**
 * 
 * @param {String} _objectId 
 * @param {Element} _domElement
 * @param {CanvasObject} _parentObject
 */
function ConnectorAnchor(_domElement, _parentObject) {
    
    /**
     * @returns {CanvasObject}
     */
    this.getParentObject = function() {
        return _parentObject;
    };

    /**
     * @returns {String}
     */
    this.getObjectId = function() {
        return _parentObject.getId();
    };

    /**
     * @returns {Number}
     */     
    this.getX = function() {
        return _parentObject.getX() + _domElement.offsetLeft;
    };

    /**
     * @returns {Number}
     */     
    this.getY = function() {
        return _parentObject.getY() + _domElement.offsetTop;
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };
};

export { ConnectorAnchor };
