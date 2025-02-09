import { Entity } from "../Entity.mjs";
import { ConnectorAnchor } from "../ConnectorAnchor.mjs";

const ClosestPairFinder = {   
    /**
     * 
     * @param {Entity} _objA 
     * @param {Entity} _objB
     * @param {Map<ConnectorAnchor, Number>} _connectorAnchorToNumValidRoutingPoints
     * @returns {Object}
     */
    findClosestPairBetweenObjects: function(_objA, _objB, _connectorAnchorToNumValidRoutingPoints) {
        const objAConnectorAnchors = _objA.getConnectorAnchors();
        const objBConnectorAnchors = _objB.getConnectorAnchors();

        var startAnchorIdxWithMinDist = 0;
        var endAnchorIdxWithMinDist = 0;
        var minDist = Number.MAX_VALUE;
        
        // Find best anchor element to connect _objA and _objB            
        // Find anchors that produce shortest straight line distance
        for(let x=0; x<objAConnectorAnchors.length; x++) {
            const aCentroid = objAConnectorAnchors[x].getCentroid();
            const objANumValidRoutingPoints = _connectorAnchorToNumValidRoutingPoints.get(objAConnectorAnchors[x].getId()) || 0;
            if(objANumValidRoutingPoints === 0) {
                continue;
            }

            for(let y=0; y<objBConnectorAnchors.length; y++) {
                const bCentroid = objBConnectorAnchors[y].getCentroid();
                const d = Math.sqrt(Math.pow(bCentroid.getX()-aCentroid.getX(),2) + Math.pow(bCentroid.getY()-aCentroid.getY(),2));
                const objBNumValidRoutingPoints = _connectorAnchorToNumValidRoutingPoints.get(objBConnectorAnchors[y].getId()) || 0;
                
                if(d < minDist && objBNumValidRoutingPoints > 0) {
                    startAnchorIdxWithMinDist = x;
                    endAnchorIdxWithMinDist = y;
                    minDist = d;
                }
            }
        }

        // If we have an anchor without no routing points, we end up with this situation
        if(minDist === Number.MAX_VALUE) {
            // Find and return the 2 anchors closest to each other
            for(let x=0; x<objAConnectorAnchors.length; x++) {
                const aCentroid = objAConnectorAnchors[x].getCentroid();
                for(let y=0; y<objBConnectorAnchors.length; y++) {
                    const bCentroid = objBConnectorAnchors[y].getCentroid();
                    const d = Math.sqrt(Math.pow(bCentroid.getX()-aCentroid.getX(),2) + Math.pow(bCentroid.getY()-aCentroid.getY(),2));

                    if(d < minDist) {
                        startAnchorIdxWithMinDist = x;
                        endAnchorIdxWithMinDist = y;                        
                        minDist = d;
                    }
                }
            }                
        }

        return {
            "objectAAnchorIndex": startAnchorIdxWithMinDist,
            "objectAAnchor": objAConnectorAnchors[startAnchorIdxWithMinDist],
            "objectBAnchorIndex": endAnchorIdxWithMinDist,
            "objectBAnchor": objBConnectorAnchors[endAnchorIdxWithMinDist],
        };
    }
};

export { ClosestPairFinder };
