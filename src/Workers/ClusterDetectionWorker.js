import {BoxClusterDetector} from '../BoxClusterDetector';
import {Cluster} from '../Cluster';
import {UUID} from '../UUID';
import {EntityOverlapFinder} from '../Overlap/EntityOverlapFinder';

const workerData = {
    requestQueue: [],
    knownClusters: []
};

/**
 * 
 * @param {Cluster[]} _clusters 
 * @returns {Object[]}
 */
const clustersToTransferrableMap = function(_clusters) {
    const result = new Map();

    for(let i=0; i<_clusters.length; i++) {
        result.set(_clusters[i].getId(), _clusters[i].toJSON());
    }

    return result;
};

const processRequestQueue = function() {
    if(workerData.requestQueue.length === 0) {
        return;
    }

    const metrics = {};
    metrics.overallTime = null;

    // grab last request, toss the rest
    const lastRequest = workerData.requestQueue.pop();
    workerData.requestQueue.length = 0;

    // process request
    const entityDescriptors = lastRequest.entityDescriptors;
    const clusterDetector = new BoxClusterDetector(12.0);

    if(lastRequest.knownClustersOverwrite !== null) {
        const toClusterArray = (_jsonArr) => {
            const result = [];
            _jsonArr.forEach((_clusterJSON) => {
                result.push(Cluster.fromJSON(_clusterJSON));
            });

            return result;
        };

        workerData.knownClusters = toClusterArray(lastRequest.knownClustersOverwrite);
    }

    const computeClustersTimeT1 = new Date();
    const clusterDetectResult = clusterDetector.computeClusters(entityDescriptors, workerData.knownClusters, UUID.v4);
    metrics.computeClustersTime = (new Date()) - computeClustersTimeT1;

    // Maybe not the best place to do this (i.e. not directly related to clusters) or maybe we should rename worker?
    const overlappingEntities = (new EntityOverlapFinder()).findOverlappingEntities(entityDescriptors);

    postMessage(
        {
            "metrics": metrics,
            "clusters": clustersToTransferrableMap(clusterDetectResult.clusters),
            "newClusterIds": clusterDetectResult.newClusterIds,
            "updatedClusterIds": clusterDetectResult.updatedClusterIds,
            "deletedClusterIds": clusterDetectResult.deletedClusterIds,
            "updatedClusterToRemovedEntitites": clusterDetectResult.updatedClusterToRemovedEntitites,
            "updatedClusterToAddedEntitites": clusterDetectResult.updatedClusterToAddedEntitites,
            "overlappingEntities": overlappingEntities,
        }
    );

    workerData.knownClusters = clusterDetectResult.clusters;
};

setInterval(processRequestQueue, 50);

onmessage = function(_req) {
    workerData.requestQueue.push(_req.data);
};
