import { LineSet } from './LineSet.mjs';
import { Rectangle } from './Rectangle.mjs';

const EntityDescriptorParser = {
    /**
     * @param {Object} _ed
     * @returns {LineSet}
     */    
    extractBoundaryLines: function(_ed) {
        const boundaryLines = new LineSet();

        if(_ed.isRoutingAroundBoundingRectAllowed) {
            const entityBoundingRect = new Rectangle(_ed.x, _ed.y, _ed.x + _ed.width, _ed.y + _ed.height);
            const lines = entityBoundingRect.getLines();
            lines.forEach((_l) => {
                boundaryLines.push(_l);
            });
        }

        const anchors = _ed.connectorAnchors;
        anchors.forEach(function(_anchor) {
            const anchorBoundingRect = new Rectangle(_anchor.x, _anchor.y, _anchor.x + _anchor.width, _anchor.y + _anchor.height);
            const lines = anchorBoundingRect.getLines();
            lines.forEach((_l) => {
                boundaryLines.push(_l);
            });
        });

        return boundaryLines;
    },
};

export { EntityDescriptorParser }
