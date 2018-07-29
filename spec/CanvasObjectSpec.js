const jsdom = require("jsdom");
import {Rectangle} from '../src/Rectangle.js';
import {CanvasObject} from '../src/CanvasObject.js';
import { Point } from "../src/Point.js";

const { JSDOM, Event } = jsdom;
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
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
    );

    expect(o.getBoundingRectange().getLeft()).toBe(100);
    expect(o.getBoundingRectange().getTop()).toBe(200);
    expect(o.getBoundingRectange().getRight()).toBe(110);
    expect(o.getBoundingRectange().getBottom()).toBe(220);
  });
  
  it("getTranslateHandleOffset returns Point with x-offset and y-offset", function() {
  
    const expectedOffset = new Point(-60, -95);

    var translateHandleElement = window.document.createElement('div');

    Object.defineProperties(translateHandleElement, {
      offsetLeft: {
        get: function() { return 10; }
      },
      offsetTop: {
        get: function() { return 20; }
      },
      offsetHeight: {
        get: function() { return 150; }
      },
      offsetWidth: {
        get: function() { return 100; }
      }
    });    

    var o = new CanvasObject(
        "obj-123",
        100, 
        200, 
        10, 
        20, 
        {}, 
        window.document.createElement('div'), 
        [translateHandleElement], 
        [window.document.createElement('div')]
    );

    const event = new window.Event('mousedown')
    translateHandleElement.dispatchEvent(event);

    expect(o.getTranslateHandleOffset().getX()).toBe(-60);
    expect(o.getTranslateHandleOffset().getY()).toBe(-95);
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
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
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
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
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
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
    );

    const anchorElem = window.document.createElement('div');
    const newAnchor = o.addInteractableConnectorAnchor(anchorElem);

    expect(o.hasConnectorAnchor(newAnchor)).toBe(true);
  }); 
});
