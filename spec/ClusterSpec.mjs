import { JSDOM } from 'jsdom';
import { Cluster } from '../src/Cluster.mjs'
import { Entity } from '../src/Entity.mjs';

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

const makeEntityDescriptor = function(_id, _x, _y, _width, _height) {
    const e = new Entity(
        _id,
        _x, 
        _y, 
        _width, 
        _height, 
        {}, 
        window.document.createElement('div'), 
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
    );

    return e.getDescriptor();
};

describe("Cluster", function() {
    it("returns ID when getId is called", function() {
        var c = new Cluster("cluster-id");
        expect(c.getId()).toBe("cluster-id");
    });

    it("returns object index when getEntityIndexById is called", function() {
        var c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));
        c.addEntity(makeEntityDescriptor("obj-id-2"));

        expect(c.getEntityIndexById("obj-id-2")).toBe(1);
    });

    it("returns object index when getEntityIndex is called", function() {
        var c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));

        var targetObj = makeEntityDescriptor("obj-id-2");
        c.addEntity(targetObj);

        expect(c.getEntityIndex(targetObj)).toBe(1);
    });    

    it("returns object IDs when getObjectIds is called", function() {
        var c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));
        c.addEntity(makeEntityDescriptor("obj-id-2"));

        expect(c.getEntityIds()).toEqual(["obj-id-1", "obj-id-2"]);
    });

    it("removes entity when removeEntity is called", function() {
        var c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));
        c.addEntity(makeEntityDescriptor("obj-id-2"));

        expect(c.removeEntityById("obj-id-1")).toEqual(true);
        expect(c.getEntityIds()).toEqual(["obj-id-2"]);
    });
});

describe("Cluster.hasEntities", function() {
    it("returns true if cluster contains all given entities", function() {
        const c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));
        c.addEntity(makeEntityDescriptor("obj-id-2"));

        expect(c.hasEntities(["obj-id-1", "obj-id-2"])).toEqual(true);
    });

    it("returns false if cluster is missing entity", function() {
        const c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1"));
        c.addEntity(makeEntityDescriptor("obj-id-2"));

        expect(c.hasEntities(["obj-id-1", "obj-id-2", "missing-one"])).toEqual(false);
    });    
});

describe("Cluster.toJSON", function() {
    it("returns JSON representation of Cluster", function() {
        const expected = { 
            "id": "cluster-id",
            "entities": [
                {
                    id: 'obj-id-1',
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    connectorAnchors: [],
                    isRoutingAroundBoundingRectAllowed: true,
                    outerBoundingRect: { minX: 10, minY: 10, maxX: 110, maxY: 110 }
                },
                {
                    id: 'obj-id-2',
                    x: 20,
                    y: 20,
                    width: 100,
                    height: 100,
                    connectorAnchors: [],
                    isRoutingAroundBoundingRectAllowed: true,
                    outerBoundingRect: {
                        minX: 20,
                        minY: 20,
                        maxX: 120,
                        maxY: 120
                    }
                }
            ]
        };

        const c = new Cluster("cluster-id");
        c.addEntity(makeEntityDescriptor("obj-id-1", 10, 10, 100, 100));
        c.addEntity(makeEntityDescriptor("obj-id-2", 20, 20, 100, 100));

        expect(c.toJSON()).toEqual(expected);
    });
});

describe("Cluster.fromJSON", function() {
    it("transforms JSON representation of cluster to Cluster object", function() {
        const inputJSON = { 
            "id": "cluster-id",
            "entities": [
                {
                    id: 'obj-id-1',
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    connectorAnchors: [],
                    outerBoundingRect: { minX: 10, minY: 10, maxX: 110, maxY: 110 }
                },
                {
                    id: 'obj-id-2',
                    x: 20,
                    y: 20,
                    width: 100,
                    height: 100,
                    connectorAnchors: [],
                    outerBoundingRect: {
                        minX: 20,
                        minY: 20,
                        maxX: 120,
                        maxY: 120
                    }
                }
            ]
        };

        const c = new Cluster.fromJSON(inputJSON);
        expect(c.getId()).toBe("cluster-id");
        expect(c.hasEntities(["obj-id-1", "obj-id-2"])).toEqual(true);
    });
});
