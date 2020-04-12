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
            });
        });

        allRoutingPoints.forEach((_rp) => {
            let isPointWithinObj = false;

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
