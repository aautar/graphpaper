import { Point } from './Point.mjs';
import { Rectangle } from './Rectangle.mjs';

/**
 * @param {String} _id
 * @param {Element} _domElement
 * @param {Sheet} _sheet
 * @param {Number} _routingPointOffsetX
 * @param {Number} _routingPointOffsetY
 */
function ConnectorAnchor(_id, _domElement, _sheet, _routingPointOffsetX, _routingPointOffsetY) {
    const self = this;
    let routingPointDirections = ["top", "left", "bottom", "right"];

    _routingPointOffsetX = _routingPointOffsetX || _sheet.getGridSize();
    _routingPointOffsetY = _routingPointOffsetY || _sheet.getGridSize();

    const getDimensions = function() {
        const r = _sheet.transformDomRectToPageSpaceRect(_domElement.getBoundingClientRect());
        return new Point(r.getWidth(), r.getHeight());
    };

    const routingPointDirectionToPoint = function(_direction, _centroid, _halfWidth, _halfHeight) {
        if(_direction === 'top') {
            return new Point(_centroid.getX(), _centroid.getY() - _halfHeight - _routingPointOffsetY);
        }

        if(_direction === 'bottom') {
            return new Point(_centroid.getX(), _centroid.getY() + _halfHeight + _routingPointOffsetY);
        }

        if(_direction === 'left') {
            return new Point(_centroid.getX() - _halfWidth - _routingPointOffsetX, _centroid.getY());
        }

        if(_direction === 'right') {
            return new Point(_centroid.getX() + _halfWidth + _routingPointOffsetX, _centroid.getY());
        }

        return null;
    };

    /**
     * 
     * @param {String[]} _directions 
     */
    this.setPossibleRoutingPointDirections = function(_directions) {
        routingPointDirections = _directions;
    };

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
        // Might want to return left edge coordinate instead
        return self.getCentroid().getX();
    };

    /**
     * @returns {Number}
     */     
    this.getY = function() {
        // Might want to return top edge coordinate instead
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
        const sheetOffset = _sheet.getSheetOffset();
        const pageSpaceRect = _sheet.transformDomRectToPageSpaceRect(_domElement.getBoundingClientRect());
        const halfWidth = pageSpaceRect.getWidth() * 0.5;
        const halfHeight = pageSpaceRect.getHeight() * 0.5;        
        
        return new Point(
            (pageSpaceRect.getLeft() + halfWidth) - sheetOffset.getX(), 
            (pageSpaceRect.getTop() + halfHeight) - sheetOffset.getY()
        );
    };

    /**
     * 
     * @returns {Point[]}
     */
    this.getRoutingPoints = function() {
        const dimensions = getDimensions();
        const centroid = self.getCentroid();
        const halfWidth = dimensions.getX() * 0.5;
        const halfHeight = dimensions.getY() * 0.5;

        const result = [];
        routingPointDirections.forEach((_dir) => {
            result.push(routingPointDirectionToPoint(_dir, centroid, halfWidth, halfHeight));
        });

        return result;
    };

    /**
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRectange = function() {
        const dimensions = getDimensions();
        const centroid = self.getCentroid();
        const halfWidth = dimensions.getX() * 0.5;
        const halfHeight = dimensions.getY() * 0.5;

        return new Rectangle(
            centroid.getX() - halfWidth, 
            centroid.getY() - halfHeight, 
            centroid.getX() + halfWidth, 
            centroid.getY() + halfHeight
        );
    };
};

export { ConnectorAnchor };
