import {Entity} from './Entity';
import {GroupTransformationContainerEvent} from './GroupTransformationContainerEvent';
import {Rectangle} from './Rectangle';

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

    var boundingRect = calculateBoundingRect();

    var accTranslateX = 0.0;
    var accTranslateY = 0.0;    

    var currentLeft = boundingRect.getLeft();
    var currentTop = boundingRect.getTop();

    const entityPositionRelativeToBoundingRect = [];

    _entities.forEach(function(_obj) {
        const rp = {
            "x": _obj.getX() - currentLeft,
            "y": _obj.getY() - currentTop
        };

        entityPositionRelativeToBoundingRect.push(rp);
    });

    const selBox = window.document.createElement("div");
    selBox.classList.add('ia-group-transformation-container');
    selBox.style.display = "none";
    selBox.style.position = "absolute";
    selBox.style.left = `${currentLeft}px`;
    selBox.style.top = `${currentTop}px`;
    selBox.style.width = `${boundingRect.getWidth()}px`;
    selBox.style.height = `${boundingRect.getHeight()}px`;    

    // only display the container if we have 1+ entity in the group
    if(_entities.length > 0) {
        selBox.style.display = "block";
    }

    if(typeof _containerStyleCssClasses === 'undefined' || _containerStyleCssClasses.length === 0) {
        // default styling if no classes are provided
        selBox.style.border = "1px solid rgb(158, 158, 158)";
        selBox.style.backgroundColor = "rgba(153, 153, 153, 0.5)";       
    } else {
        // CSS classes will control styling for things GraphPaper doesn't care about
        // (GraphPaper style concerns are handled via inline styles which will always take precedance)
        _containerStyleCssClasses.forEach(function(_class) {
            selBox.classList.add(_class);
        });
    }


    this.getContainerDomElement = function() {
        return selBox;
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

        selBox.style.left = `${currentLeft}px`;
        selBox.style.top = `${currentTop}px`;        

        for(let i=0; i<_entities.length; i++) {
            const obj = _entities[i];
            const rp = entityPositionRelativeToBoundingRect[i];

            obj.translate(
                _sheet.snapToGrid(currentLeft + rp.x), 
                _sheet.snapToGrid(currentTop + rp.y),
                true
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
        selBox.addEventListener('touchstart', translateTouchStartHandler);        
        selBox.addEventListener('mousedown', translateMouseDownHandler);
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
