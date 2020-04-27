/**
 * 
 * @param {String} _id 
 */
function Cluster(_id) {

    const self = this;

    /**
     * @type {Entity[]}
     */
    const entities = [];

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _id;
    };

    /**
     * @param {Entity} _obj
     * @returns {Number|null}
     */
    this.getObjectIndex = function(_entity) {
        return self.getObjectIndexById(_entity.getId());
    };

    /**
     * @param {String} _objId
     * @returns {Number|null}
     */
    this.getObjectIndexById = function(_entityId) {
        for(let i=0; i<entities.length; i++) {
            if(entities[i].getId() === _entityId) {
                return i;
            }
        }

        return null;
    };

    /**
     * @param {Entity} _o
     * @returns {Boolean}
     */
    this.addObject = function(_entity) {
        if(self.getObjectIndex(_entity) !== null) {
            return false;
        }

        entities.push(_entity);
        return true;
    };

    /**
     * @returns {Entity[]}
     */
    this.getObjects = function() {
        return entities;
    };

    /**
     * @returns {String[]}
     */
    this.getObjectIds = function() {
        const ids = [];
        entities.forEach(function(_o) {
            ids.push(_o.getId());
        });

        return ids;
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeObjectById = function(_id) {
        const idx = self.getObjectIndexById(_id);
        if(idx === null) {
            return false;
        }

        entities.splice(idx, 1);
        return true;
    };

    this.removeAllObjects = function() {
        entities.length = 0;
    };
};

export { Cluster };
