import {Point} from './Point';
import {PointSet} from './PointSet';
import {LineSet} from './LineSet';
import {PointVisibilityMap} from './PointVisibilityMap';

/**
 * 
 * @param {Point} _pt 
 * @returns {String}
 */
const pointToSvgLineTo = function(_pt) {
    return "L" + _pt.getX() + " " + _pt.getY();
};

/**
 * 
 * @param {Object} _connectorDescriptor
 * @param {PointSet} _anchorPoints
 * @param {PointVisibilityMap} _pointVisibilityMap 
 * 
 * @returns {String}
 */
const computeConnectorSvg = function(_connectorDescriptor, _anchorPoints, _pointVisibilityMap) {

    const anchorStartStringParts = _connectorDescriptor.anchor_start_centroid.split(' ');
    const anchorEndStringParts = _connectorDescriptor.anchor_end_centroid.split(' ');

    const anchorStartCentroid = new Point(anchorStartStringParts[0], anchorStartStringParts[1]);
    const anchorEndCentroid = new Point(anchorEndStringParts[0], anchorEndStringParts[1]);
    const anchorPointMinDist = _anchorPoints.findDistanceToPointClosestTo(anchorStartCentroid);

    // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
    // Note that when desired start or end are closed off within a boundary, values will be null
    const adjustedStart = _anchorPoints
        .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
        .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

    const adjustedEnd = _anchorPoints
        .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
        .findPointClosestTo(anchorStartCentroid);

    const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd);
    const routingPointsArray = routingPoints.toArray();

    const lineToString = [];
    routingPointsArray.forEach(function(_rp) {
        lineToString.push(pointToSvgLineTo(_rp));
    });

    lineToString.push(pointToSvgLineTo(anchorEndCentroid));

    const startCoordString = anchorStartCentroid.getX() + " " + anchorStartCentroid.getY();
    const pathString = 'M' + startCoordString + lineToString.join(" ");

    return pathString;
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

    const anchorPointsArrayBuffer = _msg.data.anchorPoints;
    const anchorPointsFloat64Array = new Float64Array(anchorPointsArrayBuffer);
    const anchorPointsSet = new PointSet(anchorPointsFloat64Array);    
    
    const currentPointVisiblityMap = new PointVisibilityMap(
        routingPointsSet,
        boundaryLinesSet
    );

    connectorDescriptors.forEach(function(_cd) {
        _cd.svgPath = computeConnectorSvg(_cd, anchorPointsSet, currentPointVisiblityMap);
    });

    metrics.overallTime = (new Date()) - overallTimeT1;

    postMessage(
        {
            "connectorDescriptors": connectorDescriptors,
            "metrics": metrics
        }
    );

};
