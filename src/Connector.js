import  {ConnectorAnchor} from './ConnectorAnchor';

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 * @param {Element} _containerDomElement
 */
function Connector(_anchorStart, _anchorEnd, _containerDomElement) {
    
    const self = this;

    const pathElem = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElem.setAttribute("d", 'M0,0 L0,0');
    pathElem.style.stroke = "#000"; 
    pathElem.style.strokeWidth = "2px";         

    const svgDomElem = _containerDomElement.appendChild(pathElem);

    this.refresh = function() {
        const startCoordString = _anchorStart.getX() + "," + _anchorStart.getY();
        const endCoordString = _anchorEnd.getX() + "," + _anchorEnd.getY();
        pathElem.setAttribute("d", 'M' + startCoordString + ' L' + endCoordString);
    };

    self.refresh();
};

export { Connector };
