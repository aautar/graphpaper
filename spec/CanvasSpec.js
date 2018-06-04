const jsdom = require("jsdom");
import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';
import {GRID_STYLE,Grid} from '../src/Grid.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

describe("Canvas", function() {

    const makeCanvasObject = function(_id, _x, _y, _width, _height) {
        const domElem = window.document.createElement('div');
        const o = new CanvasObject(
            _id,
            _x, 
            _y, 
            _width, 
            _height, 
            {}, 
            domElem, 
            domElem, 
            domElem
        );

        return o;
    };

    const canvasDomElement = window.document.createElement('div');
    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };

    it("snapToGrid snaps coordinate to grid", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        const snappedValue = canvas.snapToGrid(13);
        expect(snappedValue).toBe(canvas.getGridSize() - 1);
    });

    it("getObjectById returns added object", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
        canvas.addObject(o);

        const retunedCanvasObject = canvas.getObjectById('obj-123');
        expect(retunedCanvasObject).toBe(o);
    });

    it("getObjectById returns null for missing object", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

        var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
        canvas.addObject(o);

        const retunedCanvasObject = canvas.getObjectById('id-for-non-existent-object');
        expect(retunedCanvasObject).toBe(null);
    });  

    it("getObjectsAroundPoint returns nearby object within box-radius of 1px", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

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
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

        var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
        canvas.addObject(o);

        const retunedCanvasObjects = canvas.getObjectsAroundPoint(111, 221);
        expect(retunedCanvasObjects.length).toBe(0);
    });

    it("setGrid sets the repeating tile, grid, background on the Canvas DOM element", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

        expect(canvasDomElement.style.background).toBe("url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMTEiIHk9IjExIiBzdHlsZT0iZmlsbDojNDI0MjQyIiAvPjwvc3ZnPg==) repeat");
    });

    it("emits dblclick event", function() {

        const dblclickCallback = jasmine.createSpy("dblclick-callback");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('dblclick', dblclickCallback);

        const event = new window.MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        canvasDomElement.dispatchEvent(event);

        expect(dblclickCallback).toHaveBeenCalled()
        
    });

    it("emits click event", function() {

        const clickCallback = jasmine.createSpy("click-callback");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('click', clickCallback);

        const event = new window.MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        canvasDomElement.dispatchEvent(event);

        expect(clickCallback).toHaveBeenCalled()
        
    });    

    it("off removes handler", function() {

        const dblclickCallback = jasmine.createSpy("dblclick-callback");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('dblclick', dblclickCallback);
        canvas.off('dblclick', dblclickCallback);

        const event = new window.MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        canvasDomElement.dispatchEvent(event);

        expect(dblclickCallback).not.toHaveBeenCalled()
        
    });    

});

