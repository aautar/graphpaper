import {BoxClusterDetector} from '../src/BoxClusterDetector.js';
import {CanvasObject} from '../src/CanvasObject.js';

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
        mockDomElem, 
        mockDomElem
    );

    const o2 = new CanvasObject(
      "obj-456",
      112, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      mockDomElem, 
      mockDomElem
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
        mockDomElem, 
        mockDomElem
    );

    const o2 = new CanvasObject(
      "obj-456",
      135, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      mockDomElem, 
      mockDomElem
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
        mockDomElem, 
        mockDomElem
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
        mockDomElem, 
        mockDomElem
    );

    const o2 = new CanvasObject(
      "obj-456",
      112, 
      222, 
      10, 
      20, 
      {}, 
      mockDomElem, 
      mockDomElem, 
      mockDomElem
    );        

    const detector = new BoxClusterDetector(12.0);
    const closeByObjects = detector.getAllObjectsCloseTo(o1, [o1, o2]);
    expect(closeByObjects).toEqual([o2]);
  });  

});
