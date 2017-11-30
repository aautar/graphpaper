import {PointSet} from './PointSet';

export * from './PointVisibilityMap';

onmessage = function(_msg) {
    const routingPointsArrayBuffer = _msg.data.routingPoints;
    const routingPointsFloat64Array = new Float64Array(routingPointsArrayBuffer);

    const routingPointsSet = new PointSet();
    routingPointsSet.fromFloat64Array(routingPointsFloat64Array);

};
