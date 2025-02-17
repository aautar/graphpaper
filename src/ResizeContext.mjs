import { Entity } from "./Entity.mjs";

/**
 * 
 * @param {Entity} _entity 
 * @param {String} _resizeCursor 
 */
function ResizeContext(_entity, _resizeCursor) {
    /**
     * 
     * @returns {String}
     */
    this.getEntity = function() {
        return _entity;
    };

    /**
     * 
     * @returns {String}
     */
    this.getResizeCursor = function() {
        return _resizeCursor;
    };
};

export { ResizeContext }
