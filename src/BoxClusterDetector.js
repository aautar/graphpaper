import {Rectangle} from './Rectangle';
import  {CanvasObject} from './CanvasObject';
import  {Cluster} from './Cluster';

function BoxClusterDetector(_boxExtentOffset) {

    const self = this;

    /**
     * 
     * @param {CanvasObject} _obj 
     * @param {CanvasObject[]} _canvasObjectsArray 
     * @returns {Number}
     */
    const getObjectIndexFromArray = function(_obj, _canvasObjectsArray) {
        for(let i=0; i<_canvasObjectsArray.length; i++) {
            if(_canvasObjectsArray[i].getId() === _obj.getId()) {
                return i;
            }
        }

        return -1;
    };

    /**
     * 
     * @param {CanvasObject[]} _objects 
     * @param {CanvasObject[]} _canvasObjectsArray 
     * @returns {CanvasObject[]}
     */
    const removeObjectsFromArray = function(_objects, _canvasObjectsArray) {
        for(let i=0; i<_objects.length; i++) {
            const idx = getObjectIndexFromArray(_objects[i], _canvasObjectsArray);
            _canvasObjectsArray.splice(idx, 1);
        }

        return _canvasObjectsArray;
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
     * @param {CanvasObject} _objA
     * @param {CanvasObject} _objB
     * @returns {Boolean}
     */
    this.areObjectsClose = function(_objA, _objB) {
        const nA = new Rectangle(_objA.x-_boxExtentOffset, _objA.y-_boxExtentOffset, _objA.x + _objA.width + _boxExtentOffset, _objA.y + _objA.height + _boxExtentOffset);
        const nB = new Rectangle(_objB.x-_boxExtentOffset, _objB.y-_boxExtentOffset, _objB.x + _objB.width + _boxExtentOffset, _objB.y + _objB.height + _boxExtentOffset);
        return nA.checkIntersect(nB);
    };
   
    /**
     * @param {CanvasObject} _obj
     * @param {CanvasObject[]} _objectsUnderConsideration
     * @returns {CanvasObject[]}
     */
    this.getAllObjectsCloseTo = function(_obj, _objectsUnderConsideration) {
        const resultSet = [];
        for(let i=0; i<_objectsUnderConsideration.length; i++) {
            if(_obj.getId() === _objectsUnderConsideration[i].id) {
                continue;
            }

            if(self.areObjectsClose(_obj, _objectsUnderConsideration[i])) {
                resultSet.push(_objectsUnderConsideration[i]);
            }
        }

        return resultSet;
    };

    /**
     * @param {CanvasObject} _seedObj
     * @param {CanvasObject[]} _objectsUnderConsideration
     * @param {CanvasObject[]} _resultSet
     */
    this.getClusterObjectsFromSeed = function(_seedObj, _objectsUnderConsideration, _resultSet) {
        const closeByObjects = self.getAllObjectsCloseTo(_seedObj, _objectsUnderConsideration);
        if(closeByObjects.length === 0) {
            return [];
        } else {
            removeObjectsFromArray(closeByObjects.concat([_seedObj]), _objectsUnderConsideration);

            closeByObjects.forEach(function(_o) {
                _resultSet.push(_o);
                self.getClusterObjectsFromSeed(_o, _objectsUnderConsideration, _resultSet);
            });
        }
    };


    /**
     * @param {CanvasObject[]} _objs
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
     * @param {CanvasObject} _obj
     * @param {Cluster[]} _clusters
     */
    this.removeObjectFromClusters = function(_obj, _clusters) {
        _clusters.forEach(function(_c) {
            _c.removeObjectById(_obj.getId());
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
