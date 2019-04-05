import {Point} from './Point';
import {PointSet} from './PointSet';
import {LineSet} from './LineSet';
import {PointVisibilityMap} from './PointVisibilityMap';
import {SvgPathBuilder} from './SvgPathBuilder';

/**
 * 
 * @param {Object} _connectorDescriptor
 * @param {PointSet} _routingPointsAroundAnchorSet
 * @param {PointVisibilityMap} _pointVisibilityMap 
 * 
 * @returns {Object}
 */
const computeConnectorPath = function(_connectorDescriptor, _routingPointsAroundAnchorSet, _pointVisibilityMap) {

    const anchorStartStringParts = _connectorDescriptor.anchor_start_centroid.split(' ');
    const anchorEndStringParts = _connectorDescriptor.anchor_end_centroid.split(' ');

    const anchorStartCentroid = new Point(parseFloat(anchorStartStringParts[0]), parseFloat(anchorStartStringParts[1]));
    const anchorEndCentroid = new Point(parseFloat(anchorEndStringParts[0]), parseFloat(anchorEndStringParts[1]));
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

    // Put together all points for path
    const allPointsForPath = [anchorStartCentroid, ...routingPointsArray, anchorEndCentroid];

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
        const pathData = computeConnectorPath(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap)
        _cd.svgPath = pathData.svgPath;
        _cd.pointsInPath = pathData.pointsInPath;
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
