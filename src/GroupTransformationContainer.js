import {Entity} from './Entity';
import {Originator} from './Originator';
import {GroupTransformationContainerEvent} from './GroupTransformationContainerEvent';
import {Rectangle} from './Rectangle';
import { GroupEncapsulationBox } from './GroupEncapsulationBox';

/**
 * @param {Sheet} _sheet
 * @param {Entity[]} _entities
 * @param {String[]} _containerStyleCssClasses
 * @param {Number} _sizeAdjustmentPx
 */
function GroupTransformationContainer(_sheet, _entities, _containerStyleCssClasses, _sizeAdjustmentPx)  {
    const self = this;
    const eventNameToHandlerFunc = new Map();

    /**
     * 
     * @returns {Rectangle}
     */
    const calculateBoundingRect = function() {
        var r = _sheet.calcBoundingRectForEntities(_entities);
        if(_sizeAdjustmentPx) {
            r = r.getUniformlyResizedCopy(_sizeAdjustmentPx);
        }

        return r;
    };

    /**
     * @returns {Object[]}
     */
    const calcEntityPositionRelativeToBoundingRect = function() {
        const posRelativeToBoundingRect = [];
        _entities.forEach(function(_obj) {
            const rp = {
                "x": _obj.getX() - currentLeft,
                "y": _obj.getY() - currentTop
            };
    
            posRelativeToBoundingRect.push(rp);
        });

        return posRelativeToBoundingRect;
    };

    let boundingRect = calculateBoundingRect();
    let currentLeft = boundingRect.getLeft();
    let currentTop = boundingRect.getTop();

    var accTranslateX = 0.0;
    var accTranslateY = 0.0;    

    const entityPositionRelativeToBoundingRect = calcEntityPositionRelativeToBoundingRect();
    const encapsulationBox = new GroupEncapsulationBox(_entities, _containerStyleCssClasses, boundingRect);

    /**
     * @todo Rethink why this needs to be exposed
     * 
     * @returns {Element}
     */
    this.getContainerDomElement = function() {
        return encapsulationBox.getEncapsulationBoxDomElement();
    };
    
    /**
     * @returns {Entity[]}
     */
    this.getEntities = function() {
        return _entities;
    };

    /**
     * 
     * @returns {Rectangle}
     */
    this.getBoundingRect = function() {
        return boundingRect;
    };

    /**
     * @param {Number} _dx
     * @param {Number} _dy
     */
    this.translateByOffset = function(_dx, _dy) {
        accTranslateX += _dx;
        accTranslateY += _dy;

        const newLeft = _sheet.snapToGrid(boundingRect.getLeft() + accTranslateX);
        const newTop = _sheet.snapToGrid(boundingRect.getTop() + accTranslateY);

        if(currentLeft === newLeft && currentTop === newTop) {
            // no translation
            return;
        }

        currentLeft = newLeft;
        currentTop = newTop;

        encapsulationBox.translate(currentLeft, currentTop);

        for(let i=0; i<_entities.length; i++) {
            const rp = entityPositionRelativeToBoundingRect[i];
            _entities[i].translate(
                _sheet.snapToGrid(currentLeft + rp.x), 
                _sheet.snapToGrid(currentTop + rp.y),
                true,
                Originator.USER,
            );
        }

        const observers = eventNameToHandlerFunc.get(GroupTransformationContainerEvent.TRANSLATE) || [];
        observers.forEach(function(handler) {
            handler({
                "container": self,
                "x": currentLeft, 
                "y": currentTop
            });
        });
    };

    this.endTranslate = function() {
        accTranslateX = 0.0;
        accTranslateY = 0.0;
        boundingRect = calculateBoundingRect();
    };

    this.initTranslateInteractionHandler = function() {
        encapsulationBox.initTranslateInteractionHandler(translateMouseDownHandler, translateTouchStartHandler);
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

    const translateTouchStartHandler = function(e) {
        const observers = eventNameToHandlerFunc.get(GroupTransformationContainerEvent.TRANSLATE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "container": self,
                "x": e.touches[0].pageX, 
                "y": e.touches[0].pageY,
                "isTouch": true
            });
        });
    };

    const translateMouseDownHandler = function(e) {       
        const observers = eventNameToHandlerFunc.get(GroupTransformationContainerEvent.TRANSLATE_START) || [];
        observers.forEach(function(handler) {
            handler({
                "container": self,
                "x": e.pageX, 
                "y": e.pageY,
                "isTouch": false
            });
        });
    };
};

export {GroupTransformationContainer}
