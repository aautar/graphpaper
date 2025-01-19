import {Entity} from './Entity';
import {Originator} from './Originator';
import {GroupTransformationContainerEvent} from './GroupTransformationContainerEvent';
import {Rectangle} from './Rectangle';

/**
 * @param {Entity[]} _entities
 * @param {String[]} _containerStyleCssClasses
 * @param {Rectangle} _boundingRect
 */
function GroupEncapsulationBox(_entities, _containerStyleCssClasses, _boundingRect)  {
    const self = this;

    const encapsulationBox = window.document.createElement("div");
    encapsulationBox.classList.add('ia-group-transformation-container');
    encapsulationBox.style.display = "none";
    encapsulationBox.style.position = "absolute";
    encapsulationBox.style.left = `${_boundingRect.getLeft()}px`;
    encapsulationBox.style.top = `${_boundingRect.getTop()}px`;
    encapsulationBox.style.width = `${_boundingRect.getWidth()}px`;
    encapsulationBox.style.height = `${_boundingRect.getHeight()}px`;    

    // only display the container if we have 1+ entity in the group
    if(_entities.length > 0) {
        encapsulationBox.style.display = "block";
    }

    if(typeof _containerStyleCssClasses === 'undefined' || _containerStyleCssClasses.length === 0) {
        // default styling if no classes are provided
        encapsulationBox.style.border = "1px solid rgb(158, 158, 158)";
        encapsulationBox.style.backgroundColor = "rgba(153, 153, 153, 0.5)";       
    } else {
        // CSS classes will control styling for things GraphPaper doesn't care about
        // (GraphPaper style concerns are handled via inline styles which will always take precedance)
        _containerStyleCssClasses.forEach(function(_class) {
            encapsulationBox.classList.add(_class);
        });
    }

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    this.translate = function(_x, _y) {
        encapsulationBox.style.left = `${_x}px`;
        encapsulationBox.style.top = `${_y}px`;      
    };

    /**
     * 
     * @param {*} _translateMouseDownHandler 
     * @param {*} _translateTouchStartHandler 
     */
    this.initTranslateInteractionHandler = function(_translateMouseDownHandler, _translateTouchStartHandler) {
        encapsulationBox.addEventListener('touchstart', _translateTouchStartHandler);        
        encapsulationBox.addEventListener('mousedown', _translateMouseDownHandler);
    };

    /**
     * 
     * @returns {Element}
     */
    this.getEncapsulationBoxDomElement = function() {
        return encapsulationBox;
    };
};

export { GroupEncapsulationBox }
