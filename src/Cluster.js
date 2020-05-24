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
    this.getEntityIndex = function(_entity) {
        return self.getEntityIndexById(_entity.getId());
    };

    /**
     * @param {String} _objId
     * @returns {Number|null}
     */
    this.getEntityIndexById = function(_entityId) {
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
    this.addEntity = function(_entity) {
        if(self.getEntityIndex(_entity) !== null) {
            return false;
        }

        entities.push(_entity);
        return true;
    };

    /**
     * @returns {Entity[]}
     */
    this.getEntities = function() {
        return entities;
    };

    /**
     * @returns {String[]}
     */
    this.getEntityIds = function() {
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
    this.removeEntityById = function(_id) {
        const idx = self.getEntityIndexById(_id);
        if(idx === null) {
            return false;
        }

        entities.splice(idx, 1);
        return true;
    };

    this.removeAllEntities = function() {
        entities.length = 0;
    };
};

export { Cluster };
