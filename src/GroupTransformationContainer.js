import {CanvasObject} from './CanvasObject';
import {GroupTransformationContainerEvent} from './GroupTransformationContainerEvent';

/**
 * @param {Canvas} _canvas
 * @param {CanvasObject[]} _objects 
 */
function GroupTransformationContainer(_canvas, _objects, _borderStyle, _backgroundStyle)  {

    const self = this;
    const eventNameToHandlerFunc = new Map();
    var boundingRect = _canvas.calcBoundingRectForObjects(_objects);

    var accTranslateX = 0.0;
    var accTranslateY = 0.0;    

    var currentLeft = boundingRect.getLeft();
    var currentTop = boundingRect.getTop();

    const objPositionRelativeToBoundingRect = [];

    _objects.forEach(function(_obj) {
        const rp = {
            "x": _obj.getX() - currentLeft,
            "y": _obj.getY() - currentTop
        };

        objPositionRelativeToBoundingRect.push(rp);
    });

    if(typeof _borderStyle === 'undefined') {
        _borderStyle = "1px solid rgb(158, 158, 158)";
    }

    if(typeof _backgroundStyle === 'undefined') {
        _backgroundStyle = "rgba(153, 153, 153, 0.5)";
    }

    const selBox = window.document.createElement("div");
    selBox.style.display = "block";
    selBox.style.position = "absolute";
    selBox.style.left = `${currentLeft}px`;
    selBox.style.top = `${currentTop}px`;
    selBox.style.width = `${boundingRect.getWidth()}px`;
    selBox.style.height = `${boundingRect.getHeight()}px`;    
    selBox.style.border = _borderStyle;
    selBox.style.backgroundColor = _backgroundStyle;

    this.getContainerDomElement = function() {
        return selBox;
    };
    
    /**
     * @returns {CanvasObject[]}
     */
    this.getObjects = function() {
        return _objects;
    };

    /**
     * @param {Number} _dx
     * @param {Number} _dy
     */
    this.translateByOffset = function(_dx, _dy) {
        accTranslateX += _dx;
        accTranslateY += _dy;

        currentLeft = canvas.snapToGrid(boundingRect.getLeft() + accTranslateX);
        currentTop = canvas.snapToGrid(boundingRect.getTop() + accTranslateY);
        selBox.style.left = `${currentLeft}px`;
        selBox.style.top = `${currentTop}px`;        

        for(let i=0; i<_objects.length; i++) {
            const obj = _objects[i];
            const rp = objPositionRelativeToBoundingRect[i];

            obj.translate(
                canvas.snapToGrid(currentLeft + rp.x), 
                canvas.snapToGrid(currentTop + rp.y)
            );
        }
    };

    this.endTranslate = function() {
        accTranslateX = 0.0;
        accTranslateY = 0.0;
        boundingRect = _canvas.calcBoundingRectForObjects(_objects);
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