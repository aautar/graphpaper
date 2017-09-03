import {Cluster} from '../src/Cluster'
import {CanvasObject} from '../src/CanvasObject.js';

describe("Cluster", function() {
 
    function makeCanvasObject(_id, _x, _y, _width, _height) {
        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = new CanvasObject(
            _id,
            _x, 
            _y, 
            _width, 
            _height, 
            {}, 
            mockDomElem, 
            mockDomElem, 
            mockDomElem
        );

        return o;
    };    

    it("returns ID when getId is called", function() {
        var c = new Cluster("cluster-id");
        expect(c.getId()).toBe("cluster-id");
    });

    it("returns object index when getObjectIndex is called", function() {
        var c = new Cluster("cluster-id");
        c.addObject(makeCanvasObject("obj-id-1"));
        c.addObject(makeCanvasObject("obj-id-2"));

        expect(c.getObjectIndex("obj-id-2")).toBe(1);
    });

    it("returns object IDs when getObjectIds is called", function() {
        var c = new Cluster("cluster-id");
        c.addObject(makeCanvasObject("obj-id-1"));
        c.addObject(makeCanvasObject("obj-id-2"));

        expect(c.getObjectIds()).toEqual(["obj-id-1", "obj-id-2"]);
    });

    it("removes object when removeObject is called", function() {
        var c = new Cluster("cluster-id");
        c.addObject(makeCanvasObject("obj-id-1"));
        c.addObject(makeCanvasObject("obj-id-2"));

        expect(c.removeObject("obj-id-1")).toEqual(true);
        expect(c.getObjectIds()).toEqual(["obj-id-2"]);
    });    

});
