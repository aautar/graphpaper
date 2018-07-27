const jsdom = require("jsdom");
import {Rectangle} from '../src/Rectangle.js';
import {CanvasObject} from '../src/CanvasObject.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

describe("CanvasObject", function() {
 
  it("getBoundingRectange returns correct bounding rectangle", function() {
    const o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        window.document.createElement('div'), 
        window.document.createElement('div'), 
        window.document.createElement('div')
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


  it("addNonInteractableConnectorAnchor adds ConnectorAnchor to CanvasObject", function() {  
    const o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        window.document.createElement('div'), 
        window.document.createElement('div'), 
        window.document.createElement('div')
    );

    const anchorElem = window.document.createElement('div');
    o.addNonInteractableConnectorAnchor(anchorElem);

    expect(o.getConnectorAnchors().length).toBe(1);
  });  

  it("addInteractableConnectorAnchor adds ConnectorAnchor to CanvasObject", function() {  
    const o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        window.document.createElement('div'), 
        window.document.createElement('div'), 
        window.document.createElement('div')
    );

    const anchorElem = window.document.createElement('div');
    o.addInteractableConnectorAnchor(anchorElem);

    expect(o.getConnectorAnchors().length).toBe(1);
  }); 

});

describe("CanvasObject.hasConnectorAnchor", function() {
  it("returns true if anchor is assigned to CanvasObject", function() {  
    const o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        window.document.createElement('div'), 
        window.document.createElement('div'), 
        window.document.createElement('div')
    );

    const anchorElem = window.document.createElement('div');
    const newAnchor = o.addInteractableConnectorAnchor(anchorElem);

    expect(o.hasConnectorAnchor(newAnchor)).toBe(true);
  }); 
});