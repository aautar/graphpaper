import { Entity } from "./Entity";
import { PointSet } from "./PointSet";

const AccessibleRoutingPointsFinder = {

    /**
     * Find routing points that are not occluded by objects
     * 
     * @param {Entity[]} _subjectObjects
     * @param {Entity[]} _occludableByObjects
     * @param {Number} _gridSize
     * @returns {Object}
     */
    find: function(_subjectEntities, _occludableByEntities, _gridSize) {
        const connectorAnchorToNumValidRoutingPoints = new Map();
        const allRoutingPoints = [];
        const filteredRoutingPoints = new PointSet();

        _subjectEntities.forEach((_entity) => {
            const anchors = _entity.getConnectorAnchors();

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
                    const routingPoints = _a.getRoutingPoints(_gridSize);
                    routingPoints.forEach((_rp) => {
                        allRoutingPoints.push(
                            {
                                "routingPoint": _rp,
                                "parentAnchor": _a,
                                "parentEntity": _entity
                            }
                        );
                    });

                    connectorAnchorToNumValidRoutingPoints.set(_a.getId(), routingPoints.length);
                }
            });
        });

        allRoutingPoints.forEach((_rp) => {
            let isPointWithinObj = false;

            // check if routing point is occluded
            for(let i=0; i<_occludableByEntities.length; i++) {
                const occluder = _occludableByEntities[i];
                const boundingRect = occluder.getBoundingRectange();
                if(boundingRect.checkIsPointWithin(_rp.routingPoint)) {
                    isPointWithinObj = true;
                    const currentNumRoutingPoints = connectorAnchorToNumValidRoutingPoints.get(_rp.parentAnchor.getId()) || 0;
                    connectorAnchorToNumValidRoutingPoints.set(_rp.parentAnchor.getId(), currentNumRoutingPoints - 1);
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
