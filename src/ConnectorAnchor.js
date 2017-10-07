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
        return _parentObject.getX() + _domElement.offsetLeft + (_domElement.clientWidth * 0.5);
    };

    /**
     * @returns {Number}
     */     
    this.getY = function() {
        return _parentObject.getY() + _domElement.offsetTop + (_domElement.clientHeight * 0.5);
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };
};

export { ConnectorAnchor };
