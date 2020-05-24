import {Rectangle} from './Rectangle';
import {Entity} from './Entity';
import {Cluster} from './Cluster';

function BoxClusterDetector(_boxExtentOffset) {
    const self = this;

    /**
     * 
     * @param {Entity} _entity 
     * @param {Entity[]} _sheetEntitiesArray 
     * @returns {Number}
     */
    const getEntityIndexFromArray = function(_entity, _sheetEntitiesArray) {
        for(let i=0; i<_sheetEntitiesArray.length; i++) {
            if(_sheetEntitiesArray[i].getId() === _entity.getId()) {
                return i;
            }
        }

        return -1;
    };

    /**
     * 
     * @param {Entity[]} _entities 
     * @param {Entity[]} _sheetEntitiesArray 
     * @returns {Entity[]}
     */
    const removeEntitiesFromArray = function(_entities, _sheetEntitiesArray) {
        for(let i=0; i<_entities.length; i++) {
            const idx = getEntityIndexFromArray(_entities[i], _sheetEntitiesArray);
            if(idx !== -1) {
                _sheetEntitiesArray.splice(idx, 1);
            }
        }

        return _sheetEntitiesArray;
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
     * @param {Entity} _objA
     * @param {Entity} _objB
     * @returns {Boolean}
     */
    this.areEntitiesClose = function(_entityA, _entityB) {
        const nA = new Rectangle(
            _entityA.getX() - _boxExtentOffset, 
            _entityA.getY() - _boxExtentOffset, 
            _entityA.getX() + _entityA.getWidth() + _boxExtentOffset, 
            _entityA.getY() + _entityA.getHeight() + _boxExtentOffset
        );

        const nB = new Rectangle(
            _entityB.getX() - _boxExtentOffset, 
            _entityB.getY() - _boxExtentOffset, 
            _entityB.getX() + _entityB.getWidth() + _boxExtentOffset, 
            _entityB.getY() + _entityB.getHeight() + _boxExtentOffset
        );
        
        return nA.checkIntersect(nB);
    };
   
    /**
     * @param {Entity} _obj
     * @param {Entity[]} _entitiesUnderConsideration
     * @returns {Entity[]}
     */
    this.getAllEntitiesCloseTo = function(_entity, _entitiesUnderConsideration) {
        const resultSet = [];
        for(let i=0; i<_entitiesUnderConsideration.length; i++) {
            if(_entity.getId() === _entitiesUnderConsideration[i].getId()) {
                continue;
            }

            if(self.areEntitiesClose(_entity, _entitiesUnderConsideration[i])) {
                resultSet.push(_entitiesUnderConsideration[i]);
            }
        }

        return resultSet;
    };

    /**
     * @param {Entity} _seedObj
     * @param {Entity[]} _entitiesUnderConsideration
     * @param {Entity[]} _resultSet
     */
    this.getClusterEntitiesFromSeed = function(_seedEntity, _entitiesUnderConsideration, _resultSet) {
        const closeByEntities = self.getAllEntitiesCloseTo(_seedEntity, _entitiesUnderConsideration);
        if(closeByEntities.length === 0) {
            return [];
        } else {
            removeEntitiesFromArray(closeByEntities.concat([_seedEntity]), _entitiesUnderConsideration);

            closeByEntities.forEach(function(_o) {
                _resultSet.push(_o);
                self.getClusterEntitiesFromSeed(_o, _entitiesUnderConsideration, _resultSet);
            });
        }
    };

    /**
     * @param {Entity[]} _entities
     * @param {Cluster[]} _clusters
     * @returns {Map<Cluster,Number>}
     */
    this.findIntersectingClustersForEntities = function(_entities, _clusters) {
        // Map of Cluster that is intersecting to number of entities in _objs that is intersecting the given Cluster
        const intersectingClusterToNumEntitiesIntersecting = new Map();

        _clusters.forEach(function(_cluster) {
            const clusterEntities = _cluster.getEntities();

            for(let i=0; i<clusterEntities.length; i++) {
                for(let j=0; j<_entities.length; j++) {

                    if(clusterEntities[i].getId() !== _entities[j].getId()) {
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
     * @param {Entity} _entity
     * @param {Cluster[]} _clusters
     */
    this.removeEntityFromClusters = function(_entity, _clusters) {
        _clusters.forEach(function(_c) {
            _c.removeEntityById(_entity.getId());
        });
    };

    /**
     * @param {Entity[]} _entities
     * @param {Cluster[]} _knownClusters
     * @param {Function} _getNewIdFunc
     */
    this.computeClusters = function(_entities, _knownClusters, _getNewIdFunc) {
        const clusters = _knownClusters.map(function(_c) {
            return _c;
        });

        const entitiesUnderConsideration = _entities.map(function(_o) {
            return _o;
        });

        while(entitiesUnderConsideration.length > 0) {
            const entity = entitiesUnderConsideration.pop();

            const entitiesForCluster = [entity];
            self.getClusterEntitiesFromSeed(entity, entitiesUnderConsideration, entitiesForCluster);

            if(entitiesForCluster.length > 1) {

                const intersectingClusterToNumEntitiesIntersecting = self.findIntersectingClustersForEntities(entitiesForCluster, clusters);

                if(intersectingClusterToNumEntitiesIntersecting.size === 0) {
                    const newCluster = new Cluster(_getNewIdFunc());
                    entitiesForCluster.forEach(function(_clusterEntity) {
                        newCluster.addEntity(_clusterEntity);
                    });    

                    clusters.push(newCluster);
                } else {
                    const clusterToModify = getClusterWithMostEntitiesFromClusterMap(intersectingClusterToNumEntitiesIntersecting);

                    // Clear out entities in cluster
                    clusterToModify.removeAllEntities();

                    // Remove entity from any cluster it's currently in, add it to clusterToModify
                    entitiesForCluster.forEach(function(_clusterEntity) {
                        self.removeEntityFromClusters(_clusterEntity, clusters);                    
                        clusterToModify.addEntity(_clusterEntity);
                    });

                }

                removeEntitiesFromArray(entitiesForCluster, entitiesUnderConsideration);
                
            } else {
                self.removeEntityFromClusters(entity, clusters);
            }
        }

        // Filter out clusters w/o any entities
        const nonEmptyClusters = clusters.filter(function(_c) {
            if(_c.getEntities().length >= 2) {
                return true;
            }

            return false;
        });

        return nonEmptyClusters;
    };
};

export { BoxClusterDetector };
