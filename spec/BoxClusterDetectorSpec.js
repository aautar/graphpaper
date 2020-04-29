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
    
  it("returns true for 2 objects close to each other", function() {

    const o1 = new Entity(
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

    const o2 = new Entity(
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
    const isClose = detector.areObjectsClose(o1, o2);
    expect(isClose).toEqual(true);
  });

  it("returns false for 2 objects not near each other", function() {
    const o1 = new Entity(
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

    const o2 = new Entity(
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
    const isClose = detector.areObjectsClose(o1, o2);
    expect(isClose).toEqual(false);
  });      
});


describe("BoxClusterDetector::getAllObjectsCloseTo", function() {

  it("returns empty array if passed empty array of objects under consideration", function() {
    const o = new Entity(
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
    const closeByObjects = detector.getAllObjectsCloseTo(o, []);
    expect(closeByObjects).toEqual([]);
  });


  it("returns an array with close by objects", function() {
    const o1 = new Entity(
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

    const o2 = new Entity(
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
    const closeByObjects = detector.getAllObjectsCloseTo(o1, [o1, o2]);
    expect(closeByObjects).toEqual([o2]);
  });  

});


describe("BoxClusterDetector::getClusterObjectsFromSeed", function() {
  
  it("produces result set with 3 objects aligned in row", function() {
    const o1 = new Entity(
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

    const o2 = new Entity(
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

    const o3 = new Entity(
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

    const resultSet = [o1];

    const detector = new BoxClusterDetector(12.0);
    detector.getClusterObjectsFromSeed(o1, [o1, o2, o3], resultSet);

    expect(resultSet).toEqual([o1, o2, o3]);
  });  

});

describe("BoxClusterDetector::computeClusters", function() {
  
  it("return empty array of clusters for no objects", function() {  
    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([], []);
    expect(clusters).toEqual([]);
  });  

  it("return empty array of clusters for single object", function() {  
    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1], []);
    expect(clusters).toEqual([]);
  });
  
  it("return single Cluster for 2 objects close to each other", function() {  
    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1, o2], [], idGenerator);

    expect(clusters.length).toEqual(1);
    expect(clusters[0].getId()).toEqual('new-cluster-id');
    expect(clusters[0].getObjects().indexOf(o1) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o2) >= 0).toEqual(true);
  });

  it("adds object to exiting Cluster and returns that Cluster", function() {  
    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const newObj = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const existingCluster = new Cluster("existing-cluster-id");
    existingCluster.addObject(o1);
    existingCluster.addObject(o2);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,newObj], [existingCluster], idGenerator);

    expect(clusters.length).toEqual(1);
    expect(clusters[0].getId()).toEqual('existing-cluster-id');
    expect(clusters[0].getObjects().indexOf(o1) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o2) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(newObj) >= 0).toEqual(true);
  });  

  it("return single Cluster for 3 objects close to each other", function() {  

    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o3 = new Entity("obj-789", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,o3], [], idGenerator);

    expect(clusters.length).toEqual(1);
    expect(clusters[0].getId()).toEqual('new-cluster-id');
    expect(clusters[0].getObjects().indexOf(o1) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o2) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o3) >= 0).toEqual(true);
  });    


  it("removes moved object from an existing cluster", function() {  
    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const existingCluster = new Cluster("existing-cluster-id");
    existingCluster.addObject(o1);
    existingCluster.addObject(o2);    
    existingCluster.addObject(o3);    

    o2.translate(1000.0, 1000.0);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,o3], [existingCluster], idGenerator);

    expect(clusters.length).toEqual(1);
    expect(clusters[0].getId()).toEqual('existing-cluster-id');
    expect(clusters[0].getObjects().indexOf(o1) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o2) >= 0).toEqual(false);
    expect(clusters[0].getObjects().indexOf(o3) >= 0).toEqual(true);
  });      

  it("removes cluster when all objects have dispersed", function() {  
    const o1 = new Entity("obj-123", 100, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o2 = new Entity("obj-456", 112, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);
    const o3 = new Entity("obj-789", 114, 200, 10, 20, {}, createMockDomElem(), [createMockDomElem()], [createMockDomElem()]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const existingCluster = new Cluster("existing-cluster-id");
    existingCluster.addObject(o1);
    existingCluster.addObject(o2);    
    existingCluster.addObject(o3);    

    o1.translate(1000.0, 1000.0);
    o2.translate(2000.0, 2000.0);
    o3.translate(3000.0, 3000.0);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,o3], [existingCluster], idGenerator);

    expect(clusters.length).toEqual(0);

  });      

});
