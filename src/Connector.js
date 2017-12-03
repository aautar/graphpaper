import  {ConnectorAnchor} from './ConnectorAnchor';

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 * @param {Element} _containerDomElement
 */
function Connector(_anchorStart, _anchorEnd, _containerDomElement, _strokeColor, _strokeWidth) {
    
    const self = this;

    if(typeof _strokeColor === 'undefined') {
        _strokeColor = '#000';
    }

    if(typeof _strokeWidth === 'undefined') {
        _strokeWidth = '2px';
    }

    /**
     * 
     * @param {Point} _pt 
     * @returns {String}
     */
    const pointToSvgLineTo = function(_pt) {
        return "L" + _pt.getX() + " " + _pt.getY();
    };

    /**
     * @type {Element}
     */
    const pathElem = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElem.setAttribute("d", 'M0 0 L0 0');
    pathElem.style.stroke = _strokeColor; 
    pathElem.style.strokeWidth = _strokeWidth;         

    /**
     * @type {Element}
     */
    var svgDomElem = null;

    this.appendPathToContainerDomElement = function() {
        svgDomElem = _containerDomElement.appendChild(pathElem);
    };

    /**
     * @param {String} _svgPath
     */
    this.refresh = function(_svgPath) {
        pathElem.setAttribute("d", _svgPath);
    };

    /**
     * @returns {String}
     */
    this.getId = function() {
        const objIds = [_anchorStart.getObjectId(), _anchorEnd.getObjectId()].sort();
        return  objIds.join(':');
    };

    /**
     * @returns {Object}
     */
    this.getDescriptor = function() {
        return {
            "id": self.getId(),
            "anchor_start_centroid": _anchorStart.getCentroid().toString(),
            "anchor_end_centroid": _anchorEnd.getCentroid().toString(),
        };
    };
};

export { Connector };
