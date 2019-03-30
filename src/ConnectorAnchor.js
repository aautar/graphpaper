import  {Point} from './Point';
import  {Rectangle} from './Rectangle';

/**
 * @param {String} _id
 * @param {Element} _domElement
 * @param {Canvas} _canvas
 */
function ConnectorAnchor(_id, _domElement, _canvas) {
    
    const self = this;

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _id;
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
        const r = _domElement.getBoundingClientRect();
        return (r.right - r.left);
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        const r = _domElement.getBoundingClientRect();
        return (r.bottom - r.top);
    };

    /**
     * @returns {Point}
     */
    this.getCentroid = function() {
        const viewportRelativeRect = _domElement.getBoundingClientRect();
        const pageOffset = _canvas.getPageOffset();        
        return new Point(
            viewportRelativeRect.left + pageOffset.getX() + (self.getWidth() * 0.5), 
            viewportRelativeRect.top + pageOffset.getY() + (self.getHeight() * 0.5)
        );
    };

    /**
     * 
     * @param {Number} _gridSize 
     * @returns {Point[]}
     */
    this.getRoutingPoints = function(_gridSize) {

        const centroid = self.getCentroid();
        const halfWidth = self.getWidth() * 0.5;
        const halfHeight = self.getHeight() * 0.5;

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
        const halfWidth = self.getWidth() * 0.5;
        const halfHeight = self.getHeight() * 0.5;

        return new Rectangle(
            centroid.getX() - halfWidth, 
            centroid.getY() - halfHeight, 
            centroid.getX() + halfWidth, 
            centroid.getY() + halfHeight
        );
    };
};

export { ConnectorAnchor };
