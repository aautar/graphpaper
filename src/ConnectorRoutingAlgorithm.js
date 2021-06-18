const ConnectorRoutingAlgorithm = Object.freeze({
    STRAIGHT_LINE: 0,
    STRAIGHT_LINE_BETWEEN_ANCHORS: 1,
    STRAIGHT_LINE_BETWEEN_ANCHORS_AVOID_SELF_INTERSECTION: 2, // unsupported
    ASTAR: 3,
    ASTAR_WITH_ROUTE_OPTIMIZATION: 4,
    ASTAR_THETA_WITH_ROUTE_OPTIMIZATION: 5,
});

export { ConnectorRoutingAlgorithm };
