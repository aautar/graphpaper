import {Rectangle} from './Rectangle';
import {Cluster} from './Cluster';

function BoxClusterDetector(_boxExtentOffset) {
    const self = this;

    /**
     * 
     * @param {Object} _entityDescriptor 
     * @param {Object[]} _sheetEntityDescriptorsArray 
     * @returns {Number}
     */
    const getEntityIndexFromArray = function(_entityDescriptor, _sheetEntityDescriptorsArray) {
        for(let i=0; i<_sheetEntityDescriptorsArray.length; i++) {
            if(_sheetEntityDescriptorsArray[i].id === _entityDescriptor.id) {
                return i;
            }
        }

        return -1;
    };

    /**
     * 
     * @param {Object} _entityDescriptor 
     * @param {Object[]} _sheetEntityDescriptorsArray
     * @returns {Object[]}
     */
    const removeEntitiesFromArray = function(_entityDescriptor, _sheetEntityDescriptorsArray) {
        for(let i=0; i<_entityDescriptor.length; i++) {
            const idx = getEntityIndexFromArray(_entityDescriptor[i], _sheetEntityDescriptorsArray);
            if(idx !== -1) {
                _sheetEntityDescriptorsArray.splice(idx, 1);
            }
        }

        return _sheetEntityDescriptorsArray;
    };

    /**
     * 
     * @param {Map<Cluster, Number>} _clusterToEntityCountMap 
     * @returns {Cluster}
     */
    const getClusterWithMostEntitiesFromClusterMap = function(_clusterToEntityCountMap) {
        var curMaxObjs = 0;
        var curClusterWithMax = null;

        _clusterToEntityCountMap.forEach(function(_numObjs, _cluster, _map) {
            if(_numObjs > curMaxObjs) {
                curMaxObjs = _numObjs;
                curClusterWithMax = _cluster;
            }
        });

        return curClusterWithMax;
    };

    /**
     * @param {Map<Cluster, Number>} _clusterToEntityCountMap 
     * @returns {Cluster[]}
     */
    const getClusterArrayFromClusterMap = function(_clusterToEntityCountMap) {
        const resultSet = [];
        _clusterToEntityCountMap.keys().forEach(function(_cluster) {
            resultSet.push(_cluster);
        });

        return resultSet;
    };

    /**
     * @param {Object} _entityA
     * @param {Object} _entityB
     * @returns {Boolean}
     */
    this.areEntitiesClose = function(_entityA, _entityB) {
        const nA = new Rectangle(
            _entityA.x - _boxExtentOffset, 
            _entityA.y - _boxExtentOffset, 
            _entityA.x + _entityA.width + _boxExtentOffset, 
            _entityA.y + _entityA.height + _boxExtentOffset
        );

        const nB = new Rectangle(
            _entityB.x - _boxExtentOffset, 
            _entityB.y - _boxExtentOffset, 
            _entityB.x + _entityB.width + _boxExtentOffset, 
            _entityB.y + _entityB.height + _boxExtentOffset
        );
        
        return nA.checkIntersect(nB);
    };
   
    /**
     * @param {Object} _entityDescriptor
     * @param {Object[]} _entitiesUnderConsideration
     * @returns {Object[]}
     */
    this.getAllEntitiesCloseTo = function(_entityDescriptor, _entitiesUnderConsideration) {
        const resultSet = [];
        for(let i=0; i<_entitiesUnderConsideration.length; i++) {
            if(_entityDescriptor.id === _entitiesUnderConsideration[i].id) {
                continue;
            }

            if(self.areEntitiesClose(_entityDescriptor, _entitiesUnderConsideration[i])) {
                resultSet.push(_entitiesUnderConsideration[i]);
            }
        }

        return resultSet;
    };

    /**
     * @param {Object} _seedEntity
     * @param {Object[]} _entitiesUnderConsideration
     * @param {Object[]} _resultSet
     */
    this.getClusterEntitiesFromSeed = function(_seedEntity, _entitiesUnderConsideration, _resultSet) {
        const closeByEntities = self.getAllEntitiesCloseTo(_seedEntity, _entitiesUnderConsideration);
        if(closeByEntities.length === 0) {
            return [];
        } else {
            removeEntitiesFromArray(closeByEntities.concat([_seedEntity]), _entitiesUnderConsideration);

            closeByEntities.forEach(function(_entity) {
                _resultSet.push(_entity);
                self.getClusterEntitiesFromSeed(_entity, _entitiesUnderConsideration, _resultSet);
            });
        }
    };

    /**
     * @param {Object[]} _entityDescriptors
     * @param {Cluster[]} _clusters
     * @returns {Map<Cluster,Number>}
     */
    this.findIntersectingClustersForEntities = function(_entityDescriptors, _clusters) {
        // Map of Cluster that is intersecting to number of entities in _objs that is intersecting the given Cluster
        const intersectingClusterToNumEntitiesIntersecting = new Map();

        _clusters.forEach(function(_cluster) {
            const clusterEntities = _cluster.getEntities();

            for(let i=0; i<clusterEntities.length; i++) {
                for(let j=0; j<_entityDescriptors.length; j++) {

                    if(clusterEntities[i].id !== _entityDescriptors[j].id) {
                        continue;
                    }

                    if(intersectingClusterToNumEntitiesIntersecting.has(_cluster)) {
                        const count = intersectingClusterToNumEntitiesIntersecting.get(_cluster);
                        intersectingClusterToNumEntitiesIntersecting.set(_cluster, count+1);
                    } else {
                        intersectingClusterToNumEntitiesIntersecting.set(_cluster, 1);
                    }
                }
            }
        });

        return intersectingClusterToNumEntitiesIntersecting;
    };

    /**
     * @param {Object} _entityDescriptor
     * @param {Cluster[]} _clusters
     * @returns {String[]}
     */
    this.removeEntityFromClusters = function(_entityDescriptor, _clusters) {
        const mutatedClusterIds = [];
        _clusters.forEach(function(_c) {
            const wasFoundAndRemoved = _c.removeEntityById(_entityDescriptor.id);
            if(wasFoundAndRemoved) {
                mutatedClusterIds.push(_c.getId());
            }
        });

        return mutatedClusterIds;
    };

    /**
     * @param {Object[]} _entityDescriptors
     * @param {Cluster[]} _knownClusters
     * @param {Function} _getNewIdFunc
     */
    this.computeClusters = function(_entityDescriptors, _knownClusters, _getNewIdFunc) {
        const newClusterIds = new Set();
        const updatedClusterIds = new Set();
        const deletedClusterIds = new Set();

        const clusters = _knownClusters.map(function(_c) {
            return _c;
        });

        const entitiesUnderConsideration = _entityDescriptors.map(function(_e) {
            return _e;
        });

        while(entitiesUnderConsideration.length > 0) {
            const entityDescriptor = entitiesUnderConsideration.pop();

            const entitiesForCluster = [entityDescriptor];
            self.getClusterEntitiesFromSeed(entityDescriptor, entitiesUnderConsideration, entitiesForCluster);

            if(entitiesForCluster.length > 1) {
                const intersectingClusterToNumEntitiesIntersecting = self.findIntersectingClustersForEntities(entitiesForCluster, clusters);

                if(intersectingClusterToNumEntitiesIntersecting.size === 0) {
                    const clusterId = _getNewIdFunc();
                    const newCluster = new Cluster(clusterId);
                    entitiesForCluster.forEach(function(_clusterEntity) {
                        newCluster.addEntity(_clusterEntity);
                    });    

                    clusters.push(newCluster);
                    newClusterIds.add(clusterId);
                } else {
                    const clusterToModify = getClusterWithMostEntitiesFromClusterMap(intersectingClusterToNumEntitiesIntersecting);

                    // Clear out entities in cluster
                    clusterToModify.removeAllEntities();

                    // Remove entity from any cluster it's currently in, add it to clusterToModify
                    entitiesForCluster.forEach(function(_clusterEntity) {
                        const clustersMutated = self.removeEntityFromClusters(_clusterEntity, clusters);
                        clustersMutated.forEach((_clusterId) => {
                            updatedClusterIds.add(_clusterId);
                        });

                        clusterToModify.addEntity(_clusterEntity);
                    });

                    updatedClusterIds.add(clusterToModify.getId());
                }

                removeEntitiesFromArray(entitiesForCluster, entitiesUnderConsideration);
            } else {
                const clustersMutated = self.removeEntityFromClusters(entityDescriptor, clusters);
                clustersMutated.forEach((_clusterId) => {
                    updatedClusterIds.add(_clusterId);
                });
            }
        }

        // Get IDs of empty and singleton clusters
        const emptyAndSingletonClusters = 
            clusters
                .filter(function(_c) {
                    if(_c.getEntities().length < 2) {
                        return true;
                    }

                    return false;
                });

        // Mark empty and single clusters as deleted clusters
        emptyAndSingletonClusters.forEach((_c) => {
            updatedClusterIds.delete(_c.getId());
            deletedClusterIds.add(_c.getId());
        });

        // Don't mark new clusters as also being updated clusters
        newClusterIds.forEach((_cId) => {
            updatedClusterIds.delete(_cId);
        });

        // Filter out clusters w/o any entities
        const nonEmptyNonSingletonClusters = clusters.filter(function(_c) {
            if(_c.getEntities().length >= 2) {
                return true;
            }

            return false;
        });

        return {
            "clusters": nonEmptyNonSingletonClusters,
            "newClusterIds": newClusterIds,
            "updatedClusterIds": updatedClusterIds,
            "deletedClusterIds": deletedClusterIds,
        };
    };
};

export { BoxClusterDetector };
