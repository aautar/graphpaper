import {BoxClusterDetector} from '../BoxClusterDetector';
import {UUID} from '../UUID';

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

    const computeClustersTimeT1 = new Date();
    const clusterDetectResult = clusterDetector.computeClusters(entityDescriptors, workerData.knownClusters, UUID.v4);
    metrics.computeClustersTime = (new Date()) - computeClustersTimeT1;

    postMessage(
        {
            "metrics": metrics,
            "clusters": clustersToTransferrableMap(clusterDetectResult.clusters),
            "newClusterIds": clusterDetectResult.newClusterIds,
            "updatedClusterIds": clusterDetectResult.updatedClusterIds,
            "deletedClusterIds": clusterDetectResult.deletedClusterIds,
        }
    );

    workerData.knownClusters = clusterDetectResult.clusters;
};

setInterval(processRequestQueue, 50);

onmessage = function(_req) {
    workerData.requestQueue.push(_req.data);
};
