import {Rectangle} from './Rectangle';
import {Entity} from './Entity';
import {Cluster} from './Cluster';

function BoxClusterDetector(_boxExtentOffset) {
    const self = this;

    /**
     * 
     * @param {Entity} _obj 
     * @param {Entity[]} _sheetEntitiesArray 
     * @returns {Number}
     */
    const getObjectIndexFromArray = function(_entity, _sheetEntitiesArray) {
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
    const removeObjectsFromArray = function(_entities, _sheetEntitiesArray) {
        for(let i=0; i<_entities.length; i++) {
            const idx = getObjectIndexFromArray(_entities[i], _sheetEntitiesArray);
            if(idx !== -1) {
                _sheetEntitiesArray.splice(idx, 1);
            }
        }

        return _sheetEntitiesArray;
    };

    /**
     * 
     * @param {Map<Cluster, Number>} _clusterToObjectCountMap 
     * @returns {Cluster}
     */
    const getClusterWithMostObjectsFromClusterMap = function(_clusterToObjectCountMap)
    {
        var curMaxObjs = 0;
        var curClusterWithMax = null;

        _clusterToObjectCountMap.forEach(function(_numObjs, _cluster, _map) {
            if(_numObjs > curMaxObjs) {
                curMaxObjs = _numObjs;
                curClusterWithMax = _cluster;
            }
        });

        return curClusterWithMax;
    };

    /**
     * @param {Map<Cluster, Number>} _clusterToObjectCountMap 
     * @returns {Cluster[]}
     */
    const getClusterArrayFromClusterMap = function(_clusterToObjectCountMap) {
        const resultSet = [];
        _clusterToObjectCountMap.keys().forEach(function(_cluster) {
            resultSet.push(_cluster);
        });

        return resultSet;
    };

    /**
     * @param {Entity} _objA
     * @param {Entity} _objB
     * @returns {Boolean}
     */
    this.areObjectsClose = function(_entityA, _entityB) {

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
     * @param {Entity[]} _objectsUnderConsideration
     * @returns {Entity[]}
     */
    this.getAllObjectsCloseTo = function(_entity, _entitiesUnderConsideration) {
        const resultSet = [];
        for(let i=0; i<_entitiesUnderConsideration.length; i++) {
            if(_entity.getId() === _entitiesUnderConsideration[i].getId()) {
                continue;
            }

            if(self.areObjectsClose(_entity, _entitiesUnderConsideration[i])) {
                resultSet.push(_entitiesUnderConsideration[i]);
            }
        }

        return resultSet;
    };

    /**
     * @param {Entity} _seedObj
     * @param {Entity[]} _objectsUnderConsideration
     * @param {Entity[]} _resultSet
     */
    this.getClusterObjectsFromSeed = function(_seedEntity, _entitiesUnderConsideration, _resultSet) {
        const closeByObjects = self.getAllObjectsCloseTo(_seedEntity, _entitiesUnderConsideration);
        if(closeByObjects.length === 0) {
            return [];
        } else {
            removeObjectsFromArray(closeByObjects.concat([_seedEntity]), _entitiesUnderConsideration);

            closeByObjects.forEach(function(_o) {
                _resultSet.push(_o);
                self.getClusterObjectsFromSeed(_o, _entitiesUnderConsideration, _resultSet);
            });
        }
    };


    /**
     * @param {Entity[]} _objs
     * @param {Cluster[]} _clusters
     * @returns {Map<Cluster,Number>}
     */
    this.findIntersectingClustersForObjects = function(_objs, _clusters) {

        // Map of Cluster that is intersecting to number of objects in _objs that is intersecting the given Cluster
        const intersectingClusterToNumObjectsIntersecting = new Map();

        _clusters.forEach(function(_cluster) {

            const clusterObjs = _cluster.getObjects();

            for(let i=0; i<clusterObjs.length; i++) {
                for(let j=0; j<_objs.length; j++) {

                    if(clusterObjs[i].getId() !== _objs[j].getId()) {
                        continue;
                    }

                    if(intersectingClusterToNumObjectsIntersecting.has(_cluster)) {
                        const count = intersectingClusterToNumObjectsIntersecting.get(_cluster);
                        intersectingClusterToNumObjectsIntersecting.set(_cluster, count+1);
                    } else {
                        intersectingClusterToNumObjectsIntersecting.set(_cluster, 1);
                    }
                }
            }
        });

        return intersectingClusterToNumObjectsIntersecting;
    };

    /**
     * @param {Entity} _obj
     * @param {Cluster[]} _clusters
     */
    this.removeObjectFromClusters = function(_entity, _clusters) {
        _clusters.forEach(function(_c) {
            _c.removeObjectById(_entity.getId());
        });
    };    

    this.computeClusters = function(_objects, _knownClusters, _getNewIdFunc) {
        const clusters = _knownClusters.map(function(_c) {
            return _c;
        });

        const objectsUnderConsideration = _objects.map(function(_o) {
            return _o;
        });

        while(objectsUnderConsideration.length > 0) {
            const obj = objectsUnderConsideration.pop();

            const objsForCluster = [obj];
            self.getClusterObjectsFromSeed(obj, objectsUnderConsideration, objsForCluster);

            if(objsForCluster.length > 1) {

                const intersectingClusterToNumObjectsIntersecting = self.findIntersectingClustersForObjects(objsForCluster, clusters);

                if(intersectingClusterToNumObjectsIntersecting.size === 0) {
                    const newCluster = new Cluster(_getNewIdFunc());
                    objsForCluster.forEach(function(_clusterObject) {
                        newCluster.addObject(_clusterObject);
                    });    

                    clusters.push(newCluster);
                } else {
                    const clusterToModify = getClusterWithMostObjectsFromClusterMap(intersectingClusterToNumObjectsIntersecting);

                    // Clear out objects in cluster
                    clusterToModify.removeAllObjects();

                    // Remove object from any cluster it's currently in, add it to clusterToModify
                    objsForCluster.forEach(function(_clusterObject) {
                        self.removeObjectFromClusters(_clusterObject, clusters);                    
                        clusterToModify.addObject(_clusterObject);
                    });

                }

                removeObjectsFromArray(objsForCluster, objectsUnderConsideration);

            } else {
                self.removeObjectFromClusters(obj, clusters);
            }

        }

        // Filter out clusters w/o any objects
        const nonEmptyClusters = clusters.filter(function(_c) {
            if(_c.getObjects().length >= 2) {
                return true;
            }

            return false;
        });

        return nonEmptyClusters;
    };
    
};

export { BoxClusterDetector };
