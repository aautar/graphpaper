import {BoxClusterDetector} from '../src/BoxClusterDetector.js';
import {Entity} from '../src/Entity.js';
import {Cluster} from '../src/Cluster.js';

const createMockDomElem = function() {
    const mockDomElem = {
        addEventListener: function() { },
        style: {
            top: 0,
            left: 0
        }      
    };

    return mockDomElem;
};

describe("BoxClusterDetector::areObjectsClose", function() {
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
        );

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
        );        

        const detector = new BoxClusterDetector(12.0);
        const isClose = detector.areEntitiesClose(e1, e2);
        expect(isClose).toEqual(true);
    });

    it("returns false for 2 objects not near each other", function() {
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
        );

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
        );        

        const detector = new BoxClusterDetector(12.0);
        const isClose = detector.areEntitiesClose(e1, e2);
        expect(isClose).toEqual(false);
    });      
});


describe("BoxClusterDetector::getAllObjectsCloseTo", function() {
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
        );

        const detector = new BoxClusterDetector(12.0);
        const nearbyEntities = detector.getAllEntitiesCloseTo(entity, []);
        expect(nearbyEntities).toEqual([]);
    });

    it("returns an array with close by objects", function() {
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
        );

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
        );        

        const detector = new BoxClusterDetector(12.0);
        const nearbyEntities = detector.getAllEntitiesCloseTo(e1, [e1, e2]);
        expect(nearbyEntities).toEqual([e2]);
    }); 
});


describe("BoxClusterDetector::getClusterObjectsFromSeed", function() {
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
        );

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
        );        

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
        );        

        const resultSet = [e1];

        const detector = new BoxClusterDetector(12.0);
        detector.getClusterEntitiesFromSeed(e1, [e1, e2, e3], resultSet);

        expect(resultSet).toEqual([e1, e2, e3]);
    });
});

describe("BoxClusterDetector::computeClusters", function() {
    it("return empty array of clusters for no objects", function() {  
        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([], []);
        expect(clusters).toEqual([]);
    });  

    it("return empty array of clusters for single object", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1], []);
        expect(clusters).toEqual([]);
    });
  
    it("return single Cluster for 2 entities close to each other", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1, e2], [], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('new-cluster-id');
        expect(clusters[0].getObjects().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(e2) >= 0).toEqual(true);
    });

    it("adds entity to exiting Cluster and returns that Cluster", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const newEntity = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addObject(e1);
        existingCluster.addObject(e2);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,newEntity], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('existing-cluster-id');
        expect(clusters[0].getObjects().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(e2) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(newEntity) >= 0).toEqual(true);
    });  

    it("return single Cluster for 3 entities close to each other", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e3 = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,e3], [], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('new-cluster-id');
        expect(clusters[0].getObjects().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(e2) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(e3) >= 0).toEqual(true);
    });    

    it("removes moved entity from an existing cluster", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addObject(e1);
        existingCluster.addObject(e2);    
        existingCluster.addObject(e3);    

        e2.translate(1000.0, 1000.0);

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,e3], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(1);
        expect(clusters[0].getId()).toEqual('existing-cluster-id');
        expect(clusters[0].getObjects().indexOf(e1) >= 0).toEqual(true);
        expect(clusters[0].getObjects().indexOf(e2) >= 0).toEqual(false);
        expect(clusters[0].getObjects().indexOf(e3) >= 0).toEqual(true);
    });      

    it("removes cluster when all objects have dispersed", function() {  
        const e1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
        const e3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

        const idGenerator = function() {
            return "new-cluster-id";
        };

        const existingCluster = new Cluster("existing-cluster-id");
        existingCluster.addObject(e1);
        existingCluster.addObject(e2);    
        existingCluster.addObject(e3);    

        e1.translate(1000.0, 1000.0);
        e2.translate(2000.0, 2000.0);
        e3.translate(3000.0, 3000.0);

        const detector = new BoxClusterDetector(12.0);
        const clusters = detector.computeClusters([e1,e2,e3], [existingCluster], idGenerator);

        expect(clusters.length).toEqual(0);
    });
});
