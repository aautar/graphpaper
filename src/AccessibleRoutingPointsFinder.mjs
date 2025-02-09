import { PointSet } from "./PointSet.mjs";
import { Rectangle } from "./Rectangle.mjs";

const AccessibleRoutingPointsFinder = {

    /**
     * Find routing points that are not occluded by objects
     * 
     * @param {Object[]} _subjectEntityDescriptors
     * @param {Object[]} _occluderEntityDescriptors
     * @param {Number} _gridSize
     * @returns {Object}
     */
    find: function(_subjectEntityDescriptors, _occluderEntityDescriptors, _gridSize) {
        const connectorAnchorToNumValidRoutingPoints = new Map();
        const allRoutingPoints = [];
        const filteredRoutingPoints = new PointSet();

        _subjectEntityDescriptors.forEach((_entityDescriptor) => {
            const anchors = _entityDescriptor.connectorAnchors;

            anchors.forEach((_a) => {
                let isAnchorOccluded = false;

                // check if anchor is occluded
                // @todo Commented out for now, need a decision on how to handle anchors where centroid is on the occluder bounding rect
                /*for(let i=0; i<_occludableByObjects.length; i++) {
                    const possibleOccluderBoundingRect = _occludableByObjects[i].getBoundingRectange();
                    if(possibleOccluderBoundingRect.checkIsPointWithin(_a.getCentroid())) {
                        connectorAnchorToNumValidRoutingPoints.set(_a.getId(), 0);
                        isAnchorOccluded = true;
                        break;
                    }
                }*/

                if(!isAnchorOccluded) {
                    const routingPoints = (new PointSet(_a.routingPointsFloat64Arr)).toArray();
                    routingPoints.forEach((_rp) => {
                        allRoutingPoints.push(
                            {
                                "routingPoint": _rp,
                                "parentAnchorId": _a.id
                            }
                        );
                    });

                    connectorAnchorToNumValidRoutingPoints.set(_a.id, routingPoints.length);
                }
            });
        });

        allRoutingPoints.forEach((_rp) => {
            let isPointWithinObj = false;

            // check if routing point is occluded
            for(let i=0; i<_occluderEntityDescriptors.length; i++) {
                const occluder = _occluderEntityDescriptors[i];
                const boundingRect = new Rectangle(occluder.x, occluder.y, occluder.x + occluder.width, occluder.y + occluder.height);
                if(boundingRect.checkIsPointWithin(_rp.routingPoint)) {
                    isPointWithinObj = true;
                    const currentNumRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(_rp.parentAnchorId) || 0;
                    connectorAnchorToNumValidRoutingPoints.set(_rp.parentAnchorId, Math.max(0, currentNumRoutingPoints - 1));
                }
            }

            if(!isPointWithinObj) {
                filteredRoutingPoints.push(_rp.routingPoint);
            }
            
        });

        return {
            "connectorAnchorToNumValidRoutingPoints": connectorAnchorToNumValidRoutingPoints,
            "accessibleRoutingPoints": filteredRoutingPoints,
        };
    }
};

export { AccessibleRoutingPointsFinder };
