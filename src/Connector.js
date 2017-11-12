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

    const pathElem = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElem.setAttribute("d", 'M0 0 L0 0');
    pathElem.style.stroke = _strokeColor; 
    pathElem.style.strokeWidth = _strokeWidth;         

    var svgDomElem = null;
    this.appendPathToContainerDomElement = function() {
        svgDomElem = _containerDomElement.appendChild(pathElem);
    };

    /**
     * 
     * @param {PointVisibilityMap} _pointVisibilityMap
     */
    this.refresh = function(_pointVisibilityMap) {

        const adjustedStart = _pointVisibilityMap.findPointClosestTo(_anchorStart.getPoint());
        const adjustedEnd = _pointVisibilityMap.findPointClosestTo(_anchorEnd.getPoint());        
        const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
        const routingPointsArray = routingPoints.toArray();

        const startCoordString = _anchorStart.getX() + " " + _anchorStart.getY();

        const lineToString = [];
        routingPointsArray.forEach(function(_rp) {
            lineToString.push(pointToSvgLineTo(_rp));
        });

        lineToString.push(pointToSvgLineTo(_anchorEnd.getPoint()));

        pathElem.setAttribute("d", 'M' + startCoordString + lineToString.join(" "));
    };

    this.getId = function() {
        const objIds = [_anchorStart.getObjectId(), _anchorEnd.getObjectId()].sort();
        return  objIds.join(':');
    };
};

export { Connector };
