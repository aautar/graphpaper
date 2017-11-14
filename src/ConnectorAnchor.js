import  {Point} from './Point';

/**
 * 
 * @param {String} _objectId 
 * @param {Element} _domElement
 * @param {CanvasObject} _parentObject
 */
function ConnectorAnchor(_domElement, _parentObject) {
    
    const self = this;

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
     * @returns {Number}
     */
    this.getWidth = function() {
        return _domElement.clientWidth;
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        return _domElement.clientHeight;
    };

    /**
     * @returns {Point}
     */
    this.getPoint = function() {
        return new Point(self.getX(), self.getY());
    };

    this.getRoutingPoints = function(_gridSize) {

        const halfWidth = _domElement.clientWidth * 0.5;
        const halfHeight = _domElement.clientHeight * 0.5;

        return [
            new Point(self.getX() + halfWidth + _gridSize, self.getY()),
            new Point(self.getX() - halfWidth - _gridSize, self.getY()),
            new Point(self.getX(), self.getY() + halfHeight + _gridSize),
            new Point(self.getX(), self.getY() - halfHeight - _gridSize),
        ];
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };
};

export { ConnectorAnchor };
