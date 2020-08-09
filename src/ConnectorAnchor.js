import  {Point} from './Point';
import  {Rectangle} from './Rectangle';

/**
 * @param {String} _id
 * @param {Element} _domElement
 * @param {Sheet} _sheet
 */
function ConnectorAnchor(_id, _domElement, _sheet) {
    
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
        const r = _sheet.transformDomRectToPageSpaceRect(_domElement.getBoundingClientRect());
        return r.getWidth();
    };

    /**
     * @returns {Number}
     */
    this.getHeight = function() {
        const r = _sheet.transformDomRectToPageSpaceRect(_domElement.getBoundingClientRect());
        return r.getHeight();
    };

    /**
     * @returns {Point}
     */
    this.getCentroid = function() {
        const pageSpaceRect = _sheet.transformDomRectToPageSpaceRect(_domElement.getBoundingClientRect());
        const halfWidth = pageSpaceRect.getWidth() * 0.5;
        const halfHeight = pageSpaceRect.getHeight() * 0.5;        
        
        return new Point(
            (pageSpaceRect.getLeft() + halfWidth) - _sheet.getOffsetLeft(), 
            (pageSpaceRect.getTop() + halfHeight) - _sheet.getOffsetTop()
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
