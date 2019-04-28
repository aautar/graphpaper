import  {ConnectorAnchor} from './ConnectorAnchor';
import {Line} from './Line';

/**
 * 
 * @param {ConnectorAnchor} _anchorStart 
 * @param {ConnectorAnchor} _anchorEnd
 * @param {Element} _containerDomElement
 * @param {String} _strokeColor
 * @param {String} _strokeWidth
 */
function Connector(_anchorStart, _anchorEnd, _containerDomElement, _strokeColor, _strokeWidth) {
    
    const self = this;

    const eventNameToHandlerFunc = new Map();

    const Event = {
        CLICK: 'connector-click'
    };

    if(typeof _strokeColor === 'undefined') {
        _strokeColor = '#000';
    }

    if(typeof _strokeWidth === 'undefined') {
        _strokeWidth = '2px';
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

    pathElem.addEventListener("click", function(e) {
        const observers = eventNameToHandlerFunc.get(Event.CLICK) || [];
        observers.forEach(function(handler) {
            handler({"connector":self, "clickedAtX": e.pageX, "clickedAtY": e.pageY});
        });
    });

    /**
     * @type {Element}
     */
    var svgDomElem = null;

    this.appendPathToContainerDomElement = function() {
        svgDomElem = _containerDomElement.appendChild(pathElem);
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
     * @param {String} _svgPath
     * @param {Point[]} _pathPoints
     */
    this.refresh = function(_svgPath, _pathPoints) {
        pathPoints = _pathPoints;
        pathElem.setAttribute("d", _svgPath);
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
            "anchor_start_centroid": _anchorStart.getCentroid().toString(),
            "anchor_end_centroid": _anchorEnd.getCentroid().toString(),
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
        const allCallbacks = eventHandlers.get(_eventName) || [];

        for(let i=0; i<allCallbacks.length; i++) {
            if(allCallbacks[i] === _callback) {
                allCallbacks.splice(i, 1);
                break;
            }
        }

        eventHandlers.set(_eventName, allCallbacks);
    };    
};

export { Connector };
