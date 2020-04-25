import { CanvasObject } from "./CanvasObject";

const AccessibleRoutingPointsFinder = {

    /**
     * Find routing points that are not occluded by objects
     * 
     * @param {CanvasObject[]} _subjectObjects
     * @param {CanvasObject[]} _occludableByObjects
     * @param {Number} _gridSize
     * @returns {Object[]}
     */
    find: function(_subjectObjects, _occludableByObjects, _gridSize) {
        const connectorAnchorToNumValidRoutingPoints = new Map();
        const allRoutingPoints = [];
        const filteredRoutingPoints = [];

        _subjectObjects.forEach((_o) => {
            const anchors = _o.getConnectorAnchors();

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
                                "parentAnchor": _a
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
            for(let i=0; i<_occludableByObjects.length; i++) {
                const obj = _occludableByObjects[i];
                const boundingRect = obj.getBoundingRectange();

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
