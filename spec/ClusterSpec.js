const jsdom = require("jsdom");
import {Cluster} from '../src/Cluster'
import {Entity} from '../src/Entity.js';

const { JSDOM, Event } = jsdom;
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
