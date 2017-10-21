import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';
import {GRID_STYLE,Grid} from '../src/Grid.js';

describe("Canvas", function() {

    function makeCanvasObject(_id, _x, _y, _width, _height) {
        const mockDomElem = {
            addEventListener: function() { }
        };

        const o = new CanvasObject(
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
    btoa: function() { 
      return "a";
    },
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

  it("getConnectorRoutingPoints returns routing points", function() {
    
    const canvas = new Canvas(canvasDomElement, {}, window);
    const o = makeCanvasObject("obj-123", 100, 200, 10, 20);
    canvas.addObject(o);

    const points = canvas.getConnectorRoutingPoints();
    expect(points.length).toBe(4);

    expect(points[0].getX()).toBe(88);
    expect(points[0].getY()).toBe(188);

    expect(points[1].getX()).toBe(122);
    expect(points[1].getY()).toBe(188);    

    expect(points[2].getX()).toBe(122);
    expect(points[2].getY()).toBe(232);        

    expect(points[3].getX()).toBe(88);
    expect(points[3].getY()).toBe(232);        
  });       

  it("setGrid sets the repeating tile, grid, background on the Canvas DOM element", function() {
    
    const canvas = new Canvas(canvasDomElement, {}, window);
    canvas.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

    expect(canvasDomElement.style.background).toBe("url('data:image/svg+xml;base64,a') repeat");
  });

});

