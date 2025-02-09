import {Rectangle} from '../Rectangle.mjs';

function EntityOverlapFinder() {
    const self = this;

    /**
     * 
     * @param {Map<String,String[]>} _map 
     * @param {String} _entityAId 
     * @param {String} _entityBId 
     */
    const addOverlapMapEntries = function(_map, _entityAId, _entityBId) {
        if(_map.has(_entityAId)) {
            const existingEntries = _map.get(_entityAId);
            existingEntries.push(_entityBId);
        } else {
            _map.set(_entityAId, [_entityBId]);
        }

        if(_map.has(_entityBId)) {
            const existingEntries = _map.get(_entityBId);
            existingEntries.push(_entityAId);
        } else {
            _map.set(_entityBId, [_entityAId]);
        }        
    };

    /**
     * @param {Object[]} _entityDescriptors
     * @returns {Map<String,String[]>}
     */
    this.findOverlappingEntities = function(_entityDescriptors) {
        const overlaps = new Map();

        for(let i=0; i<_entityDescriptors.length; i++) {
            const edI = _entityDescriptors[i];
            const edIRect = new Rectangle(
                edI.x,
                edI.y,
                edI.x + edI.width,
                edI.y + edI.height
            );

            for(let j=i+1; j<_entityDescriptors.length; j++) {
                const edJ = _entityDescriptors[j];
                const edJRect = new Rectangle(
                    edJ.x,
                    edJ.y,
                    edJ.x + edJ.width,
                    edJ.y + edJ.height
                );

                const hasIntersection = edIRect.checkIntersect(edJRect);
                if(hasIntersection) {
                    addOverlapMapEntries(overlaps, edI.id, edJ.id);         
                }
            }
        }

        return overlaps;
    };
};


export { EntityOverlapFinder };
