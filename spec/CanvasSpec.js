import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';

describe("Canvas", function() {

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

  const canvasDomElement = {
    appendChild: () => {},
    style: {
      background: ""
    }    
  };

  const document = {
    createElementNS: () => { 
      return { 
        "style": {
          "width": null,
          "height": null
        }
      };
    }
  };

  const window = {
    document: document,
    btoa: function() { },
  };

  it("snapToGrid snaps coordinate to grid", function() {
    const canvas = new Canvas(canvasDomElement, {}, window);
    const snappedValue = canvas.snapToGrid(13);
    expect(snappedValue).toBe(canvas.getGridSize() - 1);
  });

  it("getObjectById returns added object", function() {
    const canvas = new Canvas(canvasDomElement, {}, window);
    var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
    canvas.addObject(o);

    const retunedCanvasObject = canvas.getObjectById('obj-123');
    expect(retunedCanvasObject).toBe(o);
  });

  it("getObjectById returns null for missing object", function() {
    const canvas = new Canvas(canvasDomElement, {}, window);

    var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
    canvas.addObject(o);

    const retunedCanvasObject = canvas.getObjectById('id-for-non-existent-object');
    expect(retunedCanvasObject).toBe(null);
  });  

  it("getObjectsAroundPoint returns nearby object within box-radius of 1px", function() {
    const canvas = new Canvas(canvasDomElement, {}, window);

    var mockDomElem = {
      addEventListener: function() { }
    };

    var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
    canvas.addObject(o);

    const retunedCanvasObjects = canvas.getObjectsAroundPoint(99, 201);
    
    expect(retunedCanvasObjects.length).toBe(1);
    expect(retunedCanvasObjects[0]).toBe(o);
  });    


  it("getObjectsAroundPoint does not return objects outside box-radius of 1px", function() {
    
    const canvas = new Canvas(canvasDomElement, {}, window);

    var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
    canvas.addObject(o);

    const retunedCanvasObjects = canvas.getObjectsAroundPoint(111, 221);
    expect(retunedCanvasObjects.length).toBe(0);
  });      

});
