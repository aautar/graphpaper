const jsdom = require("jsdom");
import {BoxClusterDetector} from '../src/BoxClusterDetector.js';
import {Entity} from '../src/Entity.js';
import {Cluster} from '../src/Cluster.js';

const { JSDOM, Event } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;
const requestAnimationFrame = () => { };

const createMockDomElem = function() {
    return window.document.createElement('div');
};

describe("BoxClusterDetector::areEntitiesClose", function() {
    it("returns true for 2 entities that are close to each other", function() {
        const e1 = new Entity(
            "obj-123",
            100, 
            200, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();

        const e2 = new Entity(
            "obj-456",
            112, 
            222, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();        

        const detector = new BoxClusterDetector(12.0);
        const isClose = detector.areEntitiesClose(e1, e2);
        expect(isClose).toEqual(true);
    });

    it("returns false for 2 entities not near each other", function() {
        const e1 = new Entity(
            "obj-123",
            100, 
            200, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();

        const e2 = new Entity(
            "obj-456",
            135, 
            222, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();        

        const detector = new BoxClusterDetector(12.0);
        const isClose = detector.areEntitiesClose(e1, e2);
        expect(isClose).toEqual(false);
    });      
});


describe("BoxClusterDetector::getAllEntitiesCloseTo", function() {
    it("returns empty array if passed empty array of objects under consideration", function() {
        const entity = new Entity(
            "obj-123",
            100, 
            200, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();

        const detector = new BoxClusterDetector(12.0);
        const nearbyEntities = detector.getAllEntitiesCloseTo(entity, []);
        expect(nearbyEntities).toEqual([]);
    });

    it("returns an array with close by entities", function() {
        const e1 = new Entity(
            "obj-123",
            100, 
            200, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();

        const e2 = new Entity(
            "obj-456",
            112, 
            222, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();        

        const detector = new BoxClusterDetector(12.0);
        const nearbyEntities = detector.getAllEntitiesCloseTo(e1, [e1, e2]);
        expect(nearbyEntities).toEqual([e2]);
    }); 
});


describe("BoxClusterDetector::getClusterEntitiesFromSeed", function() {
    it("produces result set with 3 objects aligned in row", function() {
        const e1 = new Entity(
            "obj-123",
            100, 
            200, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();

        const e2 = new Entity(
            "obj-456",
            134, 
            222, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();        

        const e3 = new Entity(
            "obj-789",
            168, 
            222, 
            10, 
            20, 
            {}, 
            createMockDomElem(), 
            [createMockDomElem()], 
            [createMockDomElem()]
        ).getDescriptor();        

        const resultSet = [e1];

        const detector = new BoxClusterDetector(12.0);
        detector.getClusterEntitiesFromSeed(e1, [e1, e2, e3], resultSet);

        expect(resultSet).toEqual([e1, e2, e3]);
    });
});

describe("BoxClusterDetector::computeClusters", function() {
    it("return empty array of clusters for no entities", function() {  
        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([], []);
        expect(clusters).toEqual([]);
    });  

    it("return empty array of clusters for single entity", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1], []);
        expect(clusters).toEqual([]);
    });
  
    it("return single Cluster for 2 entities close to each other", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1, e2], [], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('new-cluster-id');
        expect(clusters[0].getEntities().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(e2) >= 0).toEqual(true);
    });

    it("adds entity to exiting Cluster and returns that Cluster", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();
        const newEntity = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addEntity(e1);
        existingCluster.addEntity(e2);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,newEntity], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('existing-cluster-id');
        expect(clusters[0].getEntities().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(e2) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(newEntity) >= 0).toEqual(true);
    });  

    it("return single Cluster for 3 entities close to each other", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();
        const e3 = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]).getDescriptor();

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,e3], [], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('new-cluster-id');
        expect(clusters[0].getEntities().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(e2) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(e3) >= 0).toEqual(true);
    });    

    it("removes moved entity from an existing cluster", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addEntity(e1.getDescriptor());
        existingCluster.addEntity(e2.getDescriptor());    
        existingCluster.addEntity(e3.getDescriptor());    

        e2.translate(1000.0, 1000.0);

        const e1Descriptor = e1.getDescriptor();
        const e2Descriptor = e2.getDescriptor();
        const e3Descriptor = e3.getDescriptor();

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1Descriptor, e2Descriptor, e3Descriptor], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('existing-cluster-id');
        expect(clusters[0].getEntities().indexOf(e1Descriptor) >= 0).toEqual(true);
        expect(clusters[0].getEntities().indexOf(e2Descriptor) >= 0).toEqual(false);
        expect(clusters[0].getEntities().indexOf(e3Descriptor) >= 0).toEqual(true);
    });

    it("removes cluster when all objects have dispersed", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addEntity(e1);
        existingCluster.addEntity(e2);    
        existingCluster.addEntity(e3);    

        e1.translate(1000.0, 1000.0);
        e2.translate(2000.0, 2000.0);
        e3.translate(3000.0, 3000.0);

        const e1Descriptor = e1.getDescriptor();
        const e2Descriptor = e2.getDescriptor();
        const e3Descriptor = e3.getDescriptor();

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1Descriptor, e2Descriptor, e3Descriptor], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(0);
    });
});
