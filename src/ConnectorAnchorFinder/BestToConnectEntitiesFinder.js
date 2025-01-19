import { AccessibleRoutingPointsFinder } from "../AccessibleRoutingPointsFinder";
import { ClosestPairFinder as ConnectorAnchorClosestPairFinder } from "../ConnectorAnchorFinder/ClosestPairFinder";

const BestToConnectEntitiesFinder = function() {
    this.findBestTimeout = null;
    this.searchInputs = [];
    this.currentSheetEntities = [];
    this.currentGridSize = 11.0;
    this.findBufferTime = 6.94;
    this.metrics = {
        batchSize: null,
        searchFuncExecutionTime: null
    };
};

/**
 * 
 * @returns {Number}
 */
BestToConnectEntitiesFinder.prototype.getSearchFuncExecutionTime = function() {
    return this.metrics.searchFuncExecutionTime;
};

/**
 * 
 * @returns {Number}
 */
 BestToConnectEntitiesFinder.prototype.getSearchFuncBatchSize = function() {
    return this.metrics.batchSize;
};

/**
 * 
 * @param {Entity} _a 
 * @param {Entity} _b 
 * @param {Function} _cb 
 * @returns 
 */
BestToConnectEntitiesFinder.prototype.alreadyInSearchInputs = function(_a, _b, _cb) {
    for(let i=0; i<this.searchInputs.length; i++) {
        if(
            this.searchInputs[i].entityA === _a && 
            this.searchInputs[i].entityB === _b &&
            this.searchInputs[i].cb.toString() === _cb.toString()
        ) {
            return true;
        }
    }

    return false;
};

BestToConnectEntitiesFinder.prototype.clearSearchInputs = function() {
    this.searchInputs.length = 0;
};

BestToConnectEntitiesFinder.prototype.search = function() {
    const exTimeT1 = new Date();

    const inputBatchSize = this.searchInputs.length;
    const gridSize = this.currentGridSize;

    const entityDescriptors = [];
    this.currentSheetEntities.forEach(function(_e) {
        entityDescriptors[_e.getId()] = _e.getDescriptor(gridSize);
    });

    // maybe update AccessibleRoutingPointsFinder.find to handle an object?
    const entityDescriptorsArr = Object.values(entityDescriptors);

    for(let i=0; i<this.searchInputs.length; i++) {
        const accessibleRoutingPointsResult = AccessibleRoutingPointsFinder.find(
            [
                entityDescriptors[this.searchInputs[i].entityA.getId()], 
                entityDescriptors[this.searchInputs[i].entityB.getId()]
            ],
            entityDescriptorsArr,  // assuming all entities are possible occluders? maybe only consider those within extents
            gridSize
        );

        const result = ConnectorAnchorClosestPairFinder.findClosestPairBetweenObjects(
            this.searchInputs[i].entityA, 
            this.searchInputs[i].entityB, 
            accessibleRoutingPointsResult.connectorAnchorToNumValidRoutingPoints
        );

        this.searchInputs[i].cb(result);
    }

    this.metrics.batchSize = inputBatchSize;
    this.metrics.searchFuncExecutionTime = (new Date()) - exTimeT1;
};

/**
 * 
 * @param {Entity} _entityA 
 * @param {Entity} _entityB 
 * @param {Function} _onFound 
 */
BestToConnectEntitiesFinder.prototype.findBest = function(_entityA, _entityB, _onFound, _sheetEntities, _gridSize) {
    this.currentSheetEntities = _sheetEntities;
    this.currentGridSize = _gridSize;

    if(!this.alreadyInSearchInputs(_entityA, _entityB, _onFound)) {
        this.searchInputs.push(
            {
                "entityA": _entityA,
                "entityB": _entityB,
                "cb": _onFound
            }
        );
    }

    if(this.findBestTimeout) {
        clearTimeout(this.findBestTimeout);
        this.findBestTimeout = null;
    }

    const searchFunc = () => {
        this.search(this.searchInputs);
        this.findBestTimeout = null;
        this.searchInputs = [];            
    };

    this.findBestTimeout = setTimeout(searchFunc, this.findBufferTime);
};

export { BestToConnectEntitiesFinder };
