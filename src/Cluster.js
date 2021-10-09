import {DescriptorCollection} from './DescriptorCollection';

/**
 * 
 * @param {String} _clusterId
 */
function Cluster(_clusterId) {
    const descriptorCollection = new DescriptorCollection(_clusterId);

    /**
     * @returns {String}
     */
    this.getId = function() {
        return descriptorCollection.getId();
    };

    /**
     * @param {Object} _entity
     * @returns {Number|null}
     */
    this.getEntityIndex = function(_entity) {
        return descriptorCollection.getDescriptorIndex(_entity);
    };

    /**
     * @param {String} _entityId
     * @returns {Number|null}
     */
    this.getEntityIndexById = function(_entityId) {
        return descriptorCollection.getDescriptorIndexById(_entityId);
    };

    /**
     * @param {Object} _entity
     * @returns {Boolean}
     */
    this.addEntity = function(_entity) {
        return descriptorCollection.addDescriptor(_entity);
    };

    /**
     * @returns {Object[]}
     */
    this.getEntities = function() {
        return descriptorCollection.getDescriptors();
    };

    /**
     * @returns {String[]}
     */
    this.getEntityIds = function() {
        return descriptorCollection.getIds();
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeEntityById = function(_id) {
        return descriptorCollection.removeById(_id);
    };

    this.removeAllEntities = function() {
        return descriptorCollection.removeAll();
    };
};

export { Cluster };
