import {Point} from '../Point';
import {PointSet} from '../PointSet';
import {LineSet} from '../LineSet';
import {PointVisibilityMap} from '../PointVisibilityMap';
import {SvgPathBuilder} from '../SvgPathBuilder';
import {Line} from '../Line';
import {ConnectorRoutingAlgorithm} from '../ConnectorRoutingAlgorithm';

/**
 * 
 * @param {Object} _connectorDescriptor
 * @param {PointSet} _routingPointsAroundAnchorSet
 * @param {PointVisibilityMap} _pointVisibilityMap 
 * 
 * @returns {Object}
 */
const computeConnectorPath = function(_connectorDescriptor, _routingPointsAroundAnchorSet, _pointVisibilityMap) {
    const anchorStartCentroid = Point.fromArray(_connectorDescriptor.anchor_start_centroid_arr);
    const anchorEndCentroid = Point.fromArray(_connectorDescriptor.anchor_end_centroid_arr);
    const markerStartSize = _connectorDescriptor.marker_start_size;
    const markerEndSize = _connectorDescriptor.marker_end_size;
    const curvaturePx = _connectorDescriptor.curvature_px;
    const routingAlgorithm = _connectorDescriptor.routing_algorithm;

    const anchorPointMinDist = _routingPointsAroundAnchorSet.findDistanceToPointClosestTo(anchorStartCentroid);

    // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
    // Note that when desired start or end are closed off within a boundary, values will be null
    const adjustedStart = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
        .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

    const adjustedEnd = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorStartCentroid);

    let routingPoints = new PointSet();

    if(routingAlgorithm == ConnectorRoutingAlgorithm.STRAIGHT_LINE_BETWEEN_ANCHORS) {
        routingPoints = new PointSet([adjustedStart, adjustedEnd]);
    } else if(routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR || routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION) {
        const optimizeRoute = (routingAlgorithm === ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION) ? true: false;
        routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd, optimizeRoute);
    } else {
        throw "Invalid routing algorithm";
    }

    const routingPointsArray = routingPoints.toArray();
    let pathStartPoint = anchorStartCentroid;
    let pathEndPoint = anchorEndCentroid;

    // Adjust path start point to account for marker
    if(markerStartSize > 0.0 && routingPointsArray.length >= 1) {
        let firstLeg = (new Line(routingPointsArray[0], anchorStartCentroid)).createShortenedLine(0, markerStartSize);
        pathStartPoint = firstLeg.getEndPoint();
    }

    // Adjust path end point to account for marker
    if(markerEndSize > 0.0 && routingPointsArray.length >= 1) {
        let lastLeg = (new Line(routingPointsArray[routingPointsArray.length-1], anchorEndCentroid)).createShortenedLine(0, markerEndSize);
        pathEndPoint = lastLeg.getEndPoint();
    }

    // Put together all points for path
    const allPointsForPath = [pathStartPoint, ...routingPointsArray, pathEndPoint];

    return {
        "svgPath": SvgPathBuilder.pointsToPath(allPointsForPath, curvaturePx),
        "pointsInPath": allPointsForPath,
    }
};

const convertArrayBufferToFloat64Array = function(_ab) {
    return new Float64Array(_ab);
};


const requestQueue = [];
const processRequestQueue = function() {
    if(requestQueue.length === 0) {
        return;
    }

    // grab last request, toss the rest
    const lastRequest = requestQueue.pop();
    requestQueue.length = 0;

    // process request
    const metrics = {};
    metrics.overallTime = null;
    const overallTimeT1 = new Date();

    const gridSize = lastRequest.gridSize;
    const connectorDescriptors = lastRequest.connectorDescriptors;
    const entityDescriptors = lastRequest.entityDescriptors;

    const msgDecodeTimeT1 = new Date();
    const routingPointsSet = new PointSet(convertArrayBufferToFloat64Array(lastRequest.routingPoints));
    const boundaryLinesSet = new LineSet(convertArrayBufferToFloat64Array(lastRequest.boundaryLines));    
    const routingPointsAroundAnchorSet = new PointSet(convertArrayBufferToFloat64Array(lastRequest.routingPointsAroundAnchor));    
    metrics.msgDecodeTime = (new Date()) - msgDecodeTimeT1;
    
    const pointVisibilityMapCreationTimeT1 = new Date();
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );
    metrics.pointVisibilityMapCreationTime = (new Date()) - pointVisibilityMapCreationTimeT1;

    const pathComputationTimeT1 = new Date();
    connectorDescriptors.forEach(function(_cd) {
        const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap);

        const pointsInPathPointSet = new PointSet(pathData.pointsInPath);

        _cd.svgPath = pathData.svgPath;
        _cd.pointsInPath = pointsInPathPointSet.toFloat64Array().buffer;
    });
    metrics.allPathsComputationTime = (new Date()) - pathComputationTimeT1;
    
    metrics.numRoutingPoints = routingPointsSet.count();
    metrics.numBoundaryLines = boundaryLinesSet.count();
    metrics.overallTime = (new Date()) - overallTimeT1;

    postMessage(
        {
            "routingPoints": lastRequest.routingPoints,
            "boundaryLines": lastRequest.boundaryLines,
            "connectorDescriptors": connectorDescriptors,
            "pointVisibilityMapData": currentPointVisiblityMap.getPointToVisibleSetData(),
            "metrics": metrics
        }
    );

};

setInterval(processRequestQueue, 6);

onmessage = function(_req) {
    requestQueue.push(_req.data);
};
