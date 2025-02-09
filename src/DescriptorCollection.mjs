/**
 * 
 * @param {String} _collectionId
 */
 function DescriptorCollection(_collectionId) {
    const self = this;

    /**
     * @type {Object[]}
     */
    const descriptors = [];

    /**
     * @returns {String}
     */
    this.getId = function() {
        return _collectionId;
    };

    /**
     * @param {Object} _descriptor
     * @returns {Number|null}
     */
    this.getDescriptorIndex = function(_descriptor) {
        return self.getDescriptorIndexById(_descriptor.id);
    };

    /**
     * @param {String} _descriptorId
     * @returns {Number|null}
     */
    this.getDescriptorIndexById = function(_descriptorId) {
        for(let i=0; i<descriptors.length; i++) {
            if(descriptors[i].id === _descriptorId) {
                return i;
            }
        }

        return null;
    };

    /**
     * @param {Object} _descriptor
     * @returns {Boolean}
     */
    this.addDescriptor = function(_descriptor) {
        if(self.getDescriptorIndex(_descriptor) !== null) {
            return false;
        }

        descriptors.push(_descriptor);
        return true;
    };

    /**
     * @returns {Object[]}
     */
    this.getDescriptors = function() {
        return descriptors;
    };

    /**
     * @returns {String[]}
     */
    this.getIds = function() {
        const ids = [];
        descriptors.forEach(function(_d) {
            ids.push(_d.id);
        });

        return ids;
    };    

    /**
     * @param {String} _id
     * @returns {Boolean}
     */
    this.removeById = function(_id) {
        const idx = self.getDescriptorIndexById(_id);
        if(idx === null) {
            return false;
        }

        descriptors.splice(idx, 1);
        return true;
    };

    this.removeAll = function() {
        descriptors.length = 0;
    };
};

export { DescriptorCollection };
