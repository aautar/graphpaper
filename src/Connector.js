import  {ConnectorAnchor} from './ConnectorAnchor';

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 */
function Connector(_anchorStart, _anchorEnd) {
    
    this.getSVG = function() {
        const startCoordString = _anchorStart.getX() + "," + _anchorStart.getY();
        const endCoordString = _anchorEnd.getX() + "," + _anchorEnd.getY();

        return '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#F7931E" stroke="#000" d="M' + startCoordString + ' L' + endCoordString + '"></path></svg>';
    };

}

export { Connector };
