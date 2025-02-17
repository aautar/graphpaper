/**
 * 
 * @param {String} _entityId 
 * @param {String} _resizeCursor 
 */
function ResizeContext(_entityId, _resizeCursor) {

    /**
     * 
     * @returns {String}
     */
    this.getEntityId = function() {
        return _entityId;
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
