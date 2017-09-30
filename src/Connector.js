import  {CanvasObject} from './CanvasObject';

/**
 * 
 * @param {CanvasObject} _objectStart 
 * @param {CanvasObject} _objectEnd
 */
function Connector(_objectStart, _objectEnd) {
    
    this.getSVG = function() {
        return '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#F7931E" stroke="#000" d="M0,0 L50,50"></path></svg>';
    };

}

export { Connector };
