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
 * @returns {String}
 */
const computeConnectorSvg = function(_connectorDescriptor, _routingPointsAroundAnchorSet, _pointVisibilityMap) {

    const anchorStartStringParts = _connectorDescriptor.anchor_start_centroid.split(' ');
    const anchorEndStringParts = _connectorDescriptor.anchor_end_centroid.split(' ');

    const anchorStartCentroid = new Point(anchorStartStringParts[0], anchorStartStringParts[1]);
    const anchorEndCentroid = new Point(anchorEndStringParts[0], anchorEndStringParts[1]);
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

    return SvgPathBuilder.pointsToPath(allPointsForPath);
};

onmessage = function(_msg) {

    const metrics = {};
    metrics.overallTime = null;
    const overallTimeT1 = new Date();

    const gridSize = _msg.data.gridSize;

    const connectorDescriptors = _msg.data.connectorDescriptors;

    const routingPointsArrayBuffer = _msg.data.routingPoints;
    const routingPointsFloat64Array = new Float64Array(routingPointsArrayBuffer);
    const routingPointsSet = new PointSet(routingPointsFloat64Array);

    const boundaryLinesArrayBuffer = _msg.data.boundaryLines;
    const boundaryLinesFloat64Array = new Float64Array(boundaryLinesArrayBuffer);
    const boundaryLinesSet = new LineSet(boundaryLinesFloat64Array);    

    const routingPointsAroundAnchorArrayBuffer = _msg.data.routingPointsAroundAnchor;
    const routingPointsAroundAnchorFloat64Array = new Float64Array(routingPointsAroundAnchorArrayBuffer);
    const routingPointsAroundAnchorSet = new PointSet(routingPointsAroundAnchorFloat64Array);    
    
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );

    connectorDescriptors.forEach(function(_cd) {
        _cd.svgPath = computeConnectorSvg(_cd, routingPointsAroundAnchorSet, currentPointVisiblityMap);
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
