const AccessibleRoutingPointsFinder = {

    /**
     * Find routing points that are not occluded by objects
     * 
     * @param {CanvasObject[]} _objs 
     * @param {Number} _gridSize
     * @returns {Object[]}
     */
    find: function(_objs, _gridSize) {
        const connectorAnchorToNumValidRoutingPoints = new Map();
        const allRoutingPoints = [];
        const filteredRoutingPoints = [];

        _objs.forEach((_o) => {
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

            for(let i=0; i<_objs.length; i++) {
                const obj = _objs[i];
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
