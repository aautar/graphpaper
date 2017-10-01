import  {CanvasObject} from './CanvasObject';

/**
 * 
 * @param {CanvasObject} _objectStart 
 * @param {CanvasObject} _objectEnd
 */
function Connector(_objectStart, _objectEnd) {
    
    this.getSVG = function() {
        const startCoordString = _objectStart.getX() + "," + _objectStart.getY();
        const endCoordString = _objectEnd.getX() + "," + _objectEnd.getY();

        return '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#F7931E" stroke="#000" d="M' + startCoordString + ' L' + endCoordString + '"></path></svg>';
    };

}

export { Connector };
