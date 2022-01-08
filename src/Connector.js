import {ConnectorAnchor} from './ConnectorAnchor';
import {ConnectorEvent} from './ConnectorEvent';
import {ConnectorRoutingAlgorithm} from './ConnectorRoutingAlgorithm';
import {Line} from './Line';
import {Point} from './Point';

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 * @param {Element} _containerDomElement
 * @param {String} _strokeColor
 * @param {String} _strokeWidth
 * @param {Number} _curvaturePx
 * @param {ConnectorRoutingAlgorithm} _routingAlgorithm
 */
function Connector(_anchorStart, _anchorEnd, _containerDomElement, _strokeColor, _strokeWidth, _curvaturePx, _routingAlgorithm) {
    const self = this;

    const eventNameToHandlerFunc = new Map();
    let markerStartSize = 0;
    let markerEndSize = 0;

    if(typeof _strokeColor === 'undefined') {
        _strokeColor = '#000';
    }

    if(typeof _strokeWidth === 'undefined') {
        _strokeWidth = '2px';
    }

    if(typeof _curvaturePx === 'undefined') {
        _curvaturePx = 0;
    }

    if(typeof _routingAlgorithm === 'undefined') {
        _routingAlgorithm = ConnectorRoutingAlgorithm.ASTAR_THETA_WITH_ROUTE_OPTIMIZATION;
    }

    /**
     * @type {Point[]|null}
     */
    let pathPoints = null;

    /**
     * @type {Element}
     */
    const pathElem = window.document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElem.setAttribute("d", 'M0 0 L0 0');
    pathElem.style.stroke = _strokeColor;
    pathElem.style.strokeWidth = _strokeWidth;

    /**
     * @type {Element}
     * 
     * Transparent copy of pathElem, with a larger stroke, that is used for interaction (e.g. click, mousenter, etc.) events.
     * This is to address the fact that it can be difficult to interact with pathElem when the stroke is small.
     * 
     */
    const interactionElem = window.document.createElementNS("http://www.w3.org/2000/svg", 'path');
    interactionElem.setAttribute("d", 'M0 0 L0 0');
    interactionElem.style.stroke = 'transparent';
    interactionElem.style.strokeWidth = '12px';

    interactionElem.addEventListener("click", function(e) {
        self.dispatchEvent(ConnectorEvent.CLICK, {"connector":self, "clickedAtX": e.pageX, "clickedAtY": e.pageY});
    });

    interactionElem.addEventListener("mouseenter", function(e) {
        self.dispatchEvent(ConnectorEvent.MOUSE_ENTER, {"connector":self, "pointerAtX": e.pageX, "pointerAtY": e.pageY});
    });

    interactionElem.addEventListener("mouseleave", function(e) {
        self.dispatchEvent(ConnectorEvent.MOUSE_LEAVE, {"connector":self });
    });        

    this.appendPathToContainerDomElement = function() {
        _containerDomElement.appendChild(pathElem);
        _containerDomElement.appendChild(interactionElem);
    };

    /**
     * @param {String} _url
     * @param {Number} _size
     */    
    this.setMarkerStart = function(_url, _size) {
        pathElem.setAttribute(`marker-start`, `url(${_url})`);
        interactionElem.setAttribute(`marker-start`, `url(${_url})`);
        markerStartSize = _size;
    };

    this.unsetMarkerStart = function() {
        pathElem.removeAttribute(`marker-start`);
        interactionElem.removeAttribute(`marker-start`);
        markerStartSize = 0;
    };

    /**
     * @param {String} _url
     * @param {Number} _size
     */
    this.setMarkerEnd = function(_url, _size) {
        pathElem.setAttribute(`marker-end`, `url(${_url})`);
        interactionElem.setAttribute(`marker-end`, `url(${_url})`);
        markerEndSize = _size;
    };

    this.unsetMarkerEnd = function() {
        pathElem.removeAttribute(`marker-end`);
        interactionElem.removeAttribute(`marker-end`);
        markerEndSize = 0;
    };    

    /**
     * @returns {Point[]|null}
     */
    this.getPathPoints = function() {
        return pathPoints;
    };

    /**
     * @returns {Line[]}
     */
    this.getPathLines = function() {
        if(pathPoints === null || pathPoints.length < 2) {
            return [];
        }

        const lines = [];
        for(let i=0; i<pathPoints.length-1; i++) {
            lines.push(new Line(pathPoints[i], pathPoints[i+1]));
        }

        return lines;
    };

    /**
     * @returns {Number}
     */
    this.getLength = function() {
        let totalLength = 0;

        const pathLines = self.getPathLines();
        for(let i=0; i<pathLines.length; i++) {
            totalLength += pathLines[i].getLength();
        }
        
        return totalLength;
    };

    /**
     * @returns {Point}
     */
    this.getMidpoint = function() {
        const totalLength = self.getLength();
        const pathLines = self.getPathLines();

        let lengthSoFar = 0;
        let curPathLineWithMidpoint = null;

        for(let i=0; i<pathLines.length; i++) {
            curPathLineWithMidpoint = pathLines[i];
            const pathLineLength = pathLines[i].getLength();
            lengthSoFar += pathLineLength;

            if(lengthSoFar >= totalLength/2.0) {
                break;
            }
        }

        const lengthBeforeCur = (lengthSoFar - curPathLineWithMidpoint.getLength());
        const midOnCurPath = (totalLength / 2.0) - lengthBeforeCur; // i.e. distance to midpoint

        const p = midOnCurPath / curPathLineWithMidpoint.getLength();

        return new Point(
            curPathLineWithMidpoint.getStartPoint().getX() + (p * (curPathLineWithMidpoint.getEndPoint().getX() - curPathLineWithMidpoint.getStartPoint().getX())),
            curPathLineWithMidpoint.getStartPoint().getY() + (p * (curPathLineWithMidpoint.getEndPoint().getY() - curPathLineWithMidpoint.getStartPoint().getY()))
        );
    };

    /**
     * @returns {Point}
     */
    this.getMidpointDirection = function() {
        const totalLength = self.getLength();
        const pathLines = self.getPathLines();

        let lengthSoFar = 0;
        let curPathLineWithMidpoint = null;

        for(let i=0; i<pathLines.length; i++) {
            curPathLineWithMidpoint = pathLines[i];
            const pathLineLength = pathLines[i].getLength();
            lengthSoFar += pathLineLength;

            if(lengthSoFar >= totalLength/2.0) {
                break;
            }
        }

        if(curPathLineWithMidpoint === null) {
            return pathLines[0].getDirection();
        }

        return curPathLineWithMidpoint.getDirection();
    };


    /**
     * @param {String} _svgPath
     */
    this.refresh = function(_svgPath) {
        pathElem.setAttribute("d", _svgPath);
        interactionElem.setAttribute("d", _svgPath);
    };

    /**
     * 
     * @param {Point[]} _pathPoints
     */
    this.updatePathPoints = function(_pathPoints) {
        pathPoints = _pathPoints;
    };

    /**
     * @returns {String}
     */
    this.getId = function() {
        const anchorIds = [_anchorStart.getId(), _anchorEnd.getId()].sort();
        return anchorIds.join(':');
    };

    /**
     * @returns {ConnectorAnchor}
     */
    this.getAnchorStart = function() {
        return _anchorStart;
    };

    /**
     * @returns {ConnectorAnchor}
     */    
    this.getAnchorEnd = function() {
        return _anchorEnd;
    };

    this.removePathElement = function() {
        pathElem.remove();
        interactionElem.remove();
    };

    /**
     * @param {String} _cl
     * @returns {undefined}
     */
    this.addClassToDomElement = function(_cl) {
        pathElem.classList.add(_cl);
    };

    /**
     * @param {String} _cl
     * @returns {undefined}
     */    
    this.removeClassFromDomElement = function(_cl) {
        pathElem.classList.remove(_cl);
    };

    /**
     * @returns {Object}
     */
    this.getDescriptor = function() {
        return {
            "id": self.getId(),
            "anchor_start_centroid_arr": _anchorStart.getCentroid().toArray(),
            "anchor_end_centroid_arr": _anchorEnd.getCentroid().toArray(),
            "marker_start_size": markerStartSize,
            "marker_end_size": markerEndSize,
            "curvature_px": _curvaturePx,
            "routing_algorithm": _routingAlgorithm
        };
    };

    /**
     * 
     * @param {String} _eventName 
     * @param {*} _handlerFunc 
     */
    this.on = function(_eventName, _handlerFunc) {
        const allHandlers = eventNameToHandlerFunc.get(_eventName) || [];
        allHandlers.push(_handlerFunc);
        eventNameToHandlerFunc.set(_eventName, allHandlers);        
    };

    /**
     * 
     * @param {String} _eventName 
     * @param {*} _callback 
     */
    this.off = function(_eventName, _callback) {
        const allCallbacks = eventNameToHandlerFunc.get(_eventName) || [];

        for(let i=0; i<allCallbacks.length; i++) {
            if(allCallbacks[i] === _callback) {
                allCallbacks.splice(i, 1);
                break;
            }
        }

        eventNameToHandlerFunc.set(_eventName, allCallbacks);
    };

    /**
     * @param {String} _eventId
     * @param {Object} _eventData
     */
    this.dispatchEvent = function(_eventId, _eventData) {
        const observers = eventNameToHandlerFunc.get(_eventId) || [];
        observers.forEach(function(handler) {
            handler(_eventData);
        });
    };
};

export { Connector };
