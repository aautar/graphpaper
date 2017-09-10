/**
 * 
 * @param {String} _id 
 */
function Cluster(_id) {

    const self = this;

    /**
     * @type {CanvasObjects[]}
     */
    const canvasObjects = [];

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _id;
    };

    /**
     * @returns {String|null}
     */
    this.getObjectIndex = function(_id) {
        for(let i=0; i<canvasObjects.length; i++) {
            if(canvasObjects[i].getId() === _id) {
                return i;
            }
        }

        return null;
    };

    /**
     * @param {CanvasObject} _o
     * @returns {Boolean}
     */
    this.addObject = function(_o) {

        if(self.getObjectIndex(_o.getId()) !== null) {
            return false;
        }

        canvasObjects.push(_o);
        return true;
    };

    /**
     * @returns {CanvasObjects[]}
     */
    this.getObjects = function() {
        return canvasObjects;
    };

    /**
     * @returns {String[]}
     */
    this.getObjectIds = function() {
        const ids = [];
        canvasObjects.forEach(function(_o) {
            ids.push(_o.getId());
        });

        return ids;
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeObjectById = function(_id) {
        const idx = self.getObjectIndex(_id);
        if(idx === null) {
            return false;
        }

        canvasObjects.splice(idx, 1);
        return true;
    };
};

export { Cluster };
