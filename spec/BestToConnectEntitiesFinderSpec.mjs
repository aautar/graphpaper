import { BestToConnectEntitiesFinder } from '../src/ConnectorAnchorFinder/BestToConnectEntitiesFinder.mjs'

describe("BestToConnectEntitiesFinder.alreadyInSearchInputs", function() {
    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });    

    it("returns false for new entry", function() {
        const entityA = {};
        const entityB = {};

        const finder = new BestToConnectEntitiesFinder();
        const r = finder.alreadyInSearchInputs(entityA, entityB, () => { return "test"; });
        expect(r).toBe(false);
    });

    it("returns true for existing entry", function() {
        const entityA = {};
        const entityB = {};

        const finder = new BestToConnectEntitiesFinder();
        const r1 = finder.findBest(entityA, entityB, () => { return "test"; });
        const r2 = finder.alreadyInSearchInputs(entityA, entityB, () => { return "test"; });
        expect(r2).toBe(true);
    });    
});
