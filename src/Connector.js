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
     * @param {PointSet} _anchorPoints
     * @param {PointVisibilityMap} _pointVisibilityMap
     * @param {Number} _gridSize
     */
    this.refresh = function(_anchorPoints, _pointVisibilityMap, _gridSize) {

        const anchorStartCentroid = _anchorStart.getCentroid();
        const anchorPointMinDist = _anchorPoints.findDistanceToPointClosestTo(anchorStartCentroid);

        const adjustedStart = _anchorPoints
            .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist)
            .findPointClosestTo(_anchorEnd.getCentroid());

        const adjustedEnd = _anchorPoints
            .findPointsCloseTo(_anchorEnd.getCentroid(), anchorPointMinDist)
            .findPointClosestTo(anchorStartCentroid);

        const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
        const routingPointsArray = routingPoints.toArray();

        const startCoordString = anchorStartCentroid.getX() + " " + anchorStartCentroid.getY();

        const lineToString = [];
        routingPointsArray.forEach(function(_rp) {
            lineToString.push(pointToSvgLineTo(_rp));
        });

        lineToString.push(pointToSvgLineTo(_anchorEnd.getCentroid()));

        pathElem.setAttribute("d", 'M' + startCoordString + lineToString.join(" "));
    };

    /**
     * @returns {String}
     */
    this.getId = function() {
        const objIds = [_anchorStart.getObjectId(), _anchorEnd.getObjectId()].sort();
        return  objIds.join(':');
    };
};

export { Connector };
