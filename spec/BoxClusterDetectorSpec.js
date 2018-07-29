import {BoxClusterDetector} from '../src/BoxClusterDetector.js';
import {CanvasObject} from '../src/CanvasObject.js';
import {Cluster} from '../src/Cluster.js';

describe("BoxClusterDetector::areObjectsClose", function() {
    
  it("returns true for 2 objects close to each other", function() {
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        mockDomElem, 
        [mockDomElem], 
        [mockDomElem]
    );

    const o2 = new CanvasObject(
      "obj-456",
      112, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      [mockDomElem], 
      [mockDomElem]
    );        

    const detector = new BoxClusterDetector(12.0);
    const isClose = detector.areObjectsClose(o1, o2);
    expect(isClose).toEqual(true);
  });

  it("returns false for 2 objects not near each other", function() {
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        mockDomElem, 
        [mockDomElem], 
        [mockDomElem]
    );

    const o2 = new CanvasObject(
      "obj-456",
      135, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      [mockDomElem], 
      [mockDomElem]
    );        

    const detector = new BoxClusterDetector(12.0);
    const isClose = detector.areObjectsClose(o1, o2);
    expect(isClose).toEqual(false);
  });      
});


describe("BoxClusterDetector::getAllObjectsCloseTo", function() {

  it("returns empty array if passed empty array of objects under consideration", function() {

    const mockDomElem = {
      addEventListener: function() { }
    };

    const o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        mockDomElem, 
        [mockDomElem], 
        [mockDomElem]
    );

    const detector = new BoxClusterDetector(12.0);
    const closeByObjects = detector.getAllObjectsCloseTo(o, []);
    expect(closeByObjects).toEqual([]);
  });


  it("returns an array with close by objects", function() {
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        mockDomElem, 
        [mockDomElem], 
        [mockDomElem]
    );

    const o2 = new CanvasObject(
      "obj-456",
      112, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      [mockDomElem], 
      [mockDomElem]
    );        

    const detector = new BoxClusterDetector(12.0);
    const closeByObjects = detector.getAllObjectsCloseTo(o1, [o1, o2]);
    expect(closeByObjects).toEqual([o2]);
  });  

});


describe("BoxClusterDetector::getClusterObjectsFromSeed", function() {
  
  it("produces result set with 3 objects aligned in row", function() {
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        mockDomElem, 
        [mockDomElem], 
        [mockDomElem]
    );

    const o2 = new CanvasObject(
      "obj-456",
      134, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      [mockDomElem], 
      [mockDomElem]
    );        

    const o3 = new CanvasObject(
      "obj-789",
      168, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      [mockDomElem], 
      [mockDomElem]
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

    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1], []);
    expect(clusters).toEqual([]);
  });
  
  it("return single Cluster for 2 objects close to each other", function() {  
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o2 = new CanvasObject("obj-456", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

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
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o2 = new CanvasObject("obj-456", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const newObj = new CanvasObject("obj-789", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

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
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o2 = new CanvasObject("obj-456", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o3 = new CanvasObject("obj-789", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

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
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o2 = new CanvasObject("obj-456", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o3 = new CanvasObject("obj-789", 114, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const existingCluster = new Cluster("existing-cluster-id");
    existingCluster.addObject(o1);
    existingCluster.addObject(o2);    
    existingCluster.addObject(o3);    

    o2.setX(1000);
    o2.setY(1000);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,o3], [existingCluster], idGenerator);

    expect(clusters.length).toEqual(1);
    expect(clusters[0].getId()).toEqual('existing-cluster-id');
    expect(clusters[0].getObjects().indexOf(o1) >= 0).toEqual(true);
    expect(clusters[0].getObjects().indexOf(o2) >= 0).toEqual(false);
    expect(clusters[0].getObjects().indexOf(o3) >= 0).toEqual(true);
  });      

  it("removes cluster when all objects have dispersed", function() {  
    const mockDomElem = {
      addEventListener: function() { }
    };

    const o1 = new CanvasObject("obj-123", 100, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o2 = new CanvasObject("obj-456", 112, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);
    const o3 = new CanvasObject("obj-789", 114, 200, 10, 20, {}, mockDomElem, [mockDomElem], [mockDomElem]);

    const idGenerator = function() {
      return "new-cluster-id";
    };

    const existingCluster = new Cluster("existing-cluster-id");
    existingCluster.addObject(o1);
    existingCluster.addObject(o2);    
    existingCluster.addObject(o3);    

    o1.setX(1000);
    o1.setY(1000);

    o2.setX(2000);
    o2.setY(2000);

    o3.setX(3000);
    o3.setY(3000);

    const detector = new BoxClusterDetector(12.0);
    const clusters = detector.computeClusters([o1,o2,o3], [existingCluster], idGenerator);

    expect(clusters.length).toEqual(0);

  });      

});
