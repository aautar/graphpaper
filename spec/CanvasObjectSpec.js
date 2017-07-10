import {Rectangle} from '../src/Rectangle.js';
import {CanvasObject} from '../src/CanvasObject.js';

describe("CanvasObject", function() {
 
  it("getBoundingRectange returns correct bounding rectangle", function() {

    var mockDomElem = {
      addEventListener: function() { }
    };

    var o = new CanvasObject(
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

    expect(o.getBoundingRectange().getLeft()).toBe(100);
    expect(o.getBoundingRectange().getTop()).toBe(200);
    expect(o.getBoundingRectange().getRight()).toBe(110);
    expect(o.getBoundingRectange().getBottom()).toBe(220);

  });
  
  it("getTranslateHandleOffsetX return handle x-offset", function() {
  
    var mockDomElem = {
      addEventListener: function() { },
      offsetLeft: 10,
      offsetWidth: 100,
      offsetTop: 20,
      offsetHeight: 150      
    };

    var o = new CanvasObject(
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

    expect(o.getTranslateHandleOffsetX()).toBe(-60);
  });      


  it("getTranslateHandleOffsetX return handle x-offset", function() {
  
    var mockDomElem = {
      addEventListener: function() { },
      offsetLeft: 10,
      offsetWidth: 100,
      offsetTop: 20,
      offsetHeight: 150
    };

    var o = new CanvasObject(
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

    expect(o.getTranslateHandleOffsetY()).toBe(-95);
  });      


});
