import { Line } from './Line.mjs';
import { Point } from './Point.mjs';
import { PointSet } from './PointSet.mjs';
import { SvgPathBuilder } from './SvgPathBuilder.mjs';

/**
 * Note sure if this is necessary
 * 
 * @param {Connector[]} _connectors
 * @param {PointSet} _routingPointsAroundAnchor
 * @param {PointVisibilityMap} _pointVisibilityMap
 */
function ConnectorPathBuilder(_connectors, _routingPointsAroundAnchorSet, _pointVisibilityMap) {

    this.refreshPaths = function() {
        _connectors.forEach(function(_connector) {
            const pathData = computeConnectorPath(_connector.getDescriptor());
            const pointsInPathPointSet = new PointSet(pathData.pointsInPath);
            _connector.refresh(pathData.svgPath, pointsInPathPointSet.toArray());
        });
    };
    
    /**
     * 
     * @param {Object} _connectorDescriptor
     * 
     * @returns {Object}
     */
    const computeConnectorPath = function(_connectorDescriptor) {
        const anchorStartCentroid = Point.fromArray(_connectorDescriptor.anchor_start_centroid_arr);
        const anchorEndCentroid = Point.fromArray(_connectorDescriptor.anchor_end_centroid_arr);
        const markerStartSize = _connectorDescriptor.marker_start_size;
        const markerEndSize = _connectorDescriptor.marker_end_size;
        const curvaturePx = _connectorDescriptor.curvature_px;
        const optimizeRoute = _connectorDescriptor.allow_route_optimization;

        const anchorPointMinDist = _routingPointsAroundAnchorSet.findDistanceToPointClosestTo(anchorStartCentroid);

        // Find adjustedStart, adjustedEnd .. anchor points closest to the desired start point and end point
        // Note that when desired start or end are closed off within a boundary, values will be null
        const adjustedStart = _routingPointsAroundAnchorSet
            .findPointsCloseTo(anchorStartCentroid, anchorPointMinDist) // get all points within radius
            .findPointClosestTo(anchorEndCentroid); // for all points within radius, get the once closest to the endpoint

        const adjustedEnd = _routingPointsAroundAnchorSet
            .findPointsCloseTo(anchorEndCentroid, anchorPointMinDist)
            .findPointClosestTo(anchorStartCentroid);

        const routingPoints = _pointVisibilityMap.computeRoute(adjustedStart, adjustedEnd, optimizeRoute);
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
};

export { ConnectorPathBuilder }
