import { DescriptorCollection } from './DescriptorCollection.mjs';

/**
 * 
 * @param {String} _clusterId
 */
function Cluster(_clusterId) {
    const entityDescriptorCollection = new DescriptorCollection(_clusterId);

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _clusterId;
    };

    /**
     * @param {Object} _entity
     * @returns {Number|null}
     */
    this.getEntityIndex = function(_entity) {
        return entityDescriptorCollection.getDescriptorIndex(_entity);
    };

    /**
     * @param {String} _entityId
     * @returns {Number|null}
     */
    this.getEntityIndexById = function(_entityId) {
        return entityDescriptorCollection.getDescriptorIndexById(_entityId);
    };

    /**
     * @param {Object} _entity
     * @returns {Boolean}
     */
    this.addEntity = function(_entity) {
        return entityDescriptorCollection.addDescriptor(_entity);
    };

    /**
     * @returns {Object[]}
     */
    this.getEntities = function() {
        return entityDescriptorCollection.getDescriptors();
    };

    /**
     * @returns {String[]}
     */
    this.getEntityIds = function() {
        return entityDescriptorCollection.getIds();
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeEntityById = function(_id) {
        return entityDescriptorCollection.removeById(_id);
    };

    this.removeAllEntities = function() {
        return entityDescriptorCollection.removeAll();
    };

    /**
     * 
     * @param {String[]} _entityIds 
     * @returns {Boolean}
     */
    this.hasEntities = function(_entityIds) {
        let isEquivalent = true;
        for(let i=0; i<_entityIds.length; i++) {
            if(entityDescriptorCollection.getDescriptorIndexById(_entityIds[i]) === null) {
                isEquivalent = false;
                break;
            }
        }

        return isEquivalent;
    };

    /**
     * 
     * @returns {Object}
     */
    this.toJSON = function() {
        return {
            "id": _clusterId,
            "entities": entityDescriptorCollection.getDescriptors()
        };
    };
};

Cluster.fromJSON = function(_clusterJSON) {
    const result = new Cluster(_clusterJSON.id);
    _clusterJSON.entities.forEach((_entityDescriptor) => {
        result.addEntity(_entityDescriptor);
    });

    return result;
};

export { Cluster };
