import  {Point} from './Point';
import  {Rectangle} from './Rectangle';

/**
 * 
 * @param {Element} _domElement
 * @param {CanvasObject} _parentObject
 * @param {Canvas} _canvas
 */
function ConnectorAnchor(_domElement, _parentObject, _canvas) {
    
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
        return self.getCentroid().getX();
    };

    /**
     * @returns {Number}
     */     
    this.getY = function() {
        return self.getCentroid().getY();
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
    this.getCentroid = function() {
        const viewportRect = _domElement.getBoundingClientRect();
        const pageOffset = _canvas.getPageOffset();        
        return new Point(
            viewportRect.left + pageOffset.getX() + (_domElement.clientWidth * 0.5), 
            viewportRect.top + pageOffset.getY() + (_domElement.clientHeight * 0.5)
        );
    };

    /**
     * 
     * @param {Number} _gridSize 
     * @returns {Point[]}
     */
    this.getRoutingPoints = function(_gridSize) {

        const centroid = self.getCentroid();
        const halfWidth = _domElement.clientWidth * 0.5;
        const halfHeight = _domElement.clientHeight * 0.5;

        return [
            new Point(centroid.getX() + halfWidth + _gridSize, centroid.getY()),
            new Point(centroid.getX() - halfWidth - _gridSize, centroid.getY()),
            new Point(centroid.getX(), centroid.getY() + halfHeight + _gridSize),
            new Point(centroid.getX(), centroid.getY() - halfHeight - _gridSize),
        ];
    };

    /**
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRectange = function() {
        const centroid = self.getCentroid();
        const halfWidth = _domElement.clientWidth * 0.5;
        const halfHeight = _domElement.clientHeight * 0.5;

        return new Rectangle(
            centroid.getX() - halfWidth, 
            centroid.getY() - halfHeight, 
            centroid.getX() + halfWidth, 
            centroid.getY() + halfHeight
        );
    };

    /**
     * @returns {Element}
     */
    this.getDomElement = function() {
        return _domElement;
    };
};

export { ConnectorAnchor };
