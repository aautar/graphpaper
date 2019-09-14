import {Point} from './Point';
import {PointSet} from './PointSet';
import {LineSet} from './LineSet';
import {PointVisibilityMap} from './PointVisibilityMap';
import {SvgPathBuilder} from './SvgPathBuilder';
import {Line} from './Line';

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

    const anchorPointMinDist = _routingPointsAroundAnchorSet.findDistanceToPointClosestTo(anchorStartCentroid);

    // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
    // Note that when desired start or end are closed off within a boundary, values will be null
    const adjustedStart = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
        .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

    const adjustedEnd = _routingPointsAroundAnchorSet
        .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorStartCentroid);

    const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
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
        "svgPath": SvgPathBuilder.pointsToPath(allPointsForPath),
        "pointsInPath": allPointsForPath,
    }
};

const convertArrayBufferToFloat64Array = function(_ab) {
    return new Float64Array(_ab);
};

onmessage = function(_msg) {

    const metrics = {};
    metrics.overallTime = null;
    const overallTimeT1 = new Date();

    const gridSize = _msg.data.gridSize;

    const connectorDescriptors = _msg.data.connectorDescriptors;

    const routingPointsSet = new PointSet(convertArrayBufferToFloat64Array(_msg.data.routingPoints));
    const boundaryLinesSet = new LineSet(convertArrayBufferToFloat64Array(_msg.data.boundaryLines));    
    const routingPointsAroundAnchorSet = new PointSet(convertArrayBufferToFloat64Array(_msg.data.routingPointsAroundAnchor));    
    
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );

    connectorDescriptors.forEach(function(_cd) {
        const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap);

        const pointsInPathPointSet = new PointSet(pathData.pointsInPath);

        _cd.svgPath = pathData.svgPath;
        _cd.pointsInPath = pointsInPathPointSet.toFloat64Array().buffer;
    });

    metrics.overallTime = (new Date()) - overallTimeT1;
    metrics.numRoutingPoints = routingPointsSet.count();
    metrics.numBoundaryLines = boundaryLinesSet.count();

    postMessage(
        {
            "connectorDescriptors": connectorDescriptors,
            "metrics": metrics
        }
    );

};
