import { AccessibleRoutingPointsFinder } from '../src/AccessibleRoutingPointsFinder'

describe("AccessibleRoutingPointsFinder.find", function() {
    it("return correct result for empty set of objects", function() {
        const result = AccessibleRoutingPointsFinder.find([], [], 12.0);

        expect(result.connectorAnchorToNumValidRoutingPoints.constructor.name).toBe(Map.name);
        expect(result.connectorAnchorToNumValidRoutingPoints.size).toBe(0);

        expect(result.accessibleRoutingPoints.constructor.name).toBe('PointSet');
        expect(result.accessibleRoutingPoints.count()).toBe(0);
    });
});
