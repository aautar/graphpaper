import {DescriptorCollection} from './DescriptorCollection';

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
     * @returns {Object}
     */
    this.toJSON = function() {
        return {
            "id": _clusterId,
            "entities": entityDescriptorCollection.getDescriptors()
        };
    };
};

export { Cluster };
