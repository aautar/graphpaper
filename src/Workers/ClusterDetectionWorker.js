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
const clustersToTransferrableObject = function(_clusters) {
    const result = [];

    for(let i=0; i<_clusters.length; i++) {
        const clusterObj = _clusters[i].toJSON();
        result.push(clusterObj);
    }

    return result;
};

const processRequestQueue = function() {
    if(workerData.requestQueue.length === 0) {
        return;
    }

    // grab last request, toss the rest
    const lastRequest = workerData.requestQueue.pop();
    workerData.requestQueue.length = 0;

    // process request
    const entityDescriptors = lastRequest.entityDescriptors;
    const clusterDetector = new BoxClusterDetector(12.0);

    const clusterDetectResult = clusterDetector.computeClusters(entityDescriptors, workerData.knownClusters, UUID.v4);

    postMessage(
        {
            "clusters": clustersToTransferrableObject(clusterDetectResult.clusters),
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
