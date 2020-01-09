const jsdom = require("jsdom");
import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';
import {ConnectorAnchor} from '../src/ConnectorAnchor.js';
import {GRID_STYLE,Grid} from '../src/Grid.js';
import { CanvasEvent } from '../src/CanvasEvent.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

global.Worker = function() { 
    this.postMessage = function() { }
};

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
            [domElem], 
            [domElem]
        );

        return o;
    };

    const canvasDomElement = window.document.createElement('div');
    Object.defineProperty(canvasDomElement, 'offsetWidth', {value: 1000});
    Object.defineProperty(canvasDomElement, 'offsetHeight', {value: 2000});

    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };

    it("getWidth returns canvas width", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        expect(canvas.getWidth()).toBe(1000);
    });

    it("getHeight returns canvas width", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        expect(canvas.getHeight()).toBe(2000);
    });    

    it("calcBoundingBox returns bounding box for entire canvas when empty", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        const bbox = canvas.calcBoundingBox();

        expect(bbox.getLeft()).toBe(0);
        expect(bbox.getTop()).toBe(0);
        expect(bbox.getBottom()).toBe(2000);
        expect(bbox.getRight()).toBe(1000);
    });        

    it("calcBoundingBox returns bounding box for area encompassing objects", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

        const o1 = makeCanvasObject("obj-1", 100, 200, 10, 20);
        const o2 = makeCanvasObject("obj-2", 400, 200, 10, 20);
        canvas.addObject(o1);
        canvas.addObject(o2);

        const bbox = canvas.calcBoundingBox();

        expect(bbox.getLeft()).toBe(100);
        expect(bbox.getTop()).toBe(200);
        expect(bbox.getBottom()).toBe(220);
        expect(bbox.getRight()).toBe(410);
    });            

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

    it("getObjectsAroundPoint returns surrounding object", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
        canvas.addObject(o);

        const retunedCanvasObjects = canvas.getObjectsAroundPoint(105, 210);

        expect(retunedCanvasObjects.length).toBe(1);
        expect(retunedCanvasObjects[0]).toBe(o);
    });        

    it("getObjectsAroundPoint does not return objects outside box-radius of 1px", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);

        var o = makeCanvasObject("obj-123", 100, 200, 10, 20);
        canvas.addObject(o);

        const retunedCanvasObjects = canvas.getObjectsAroundPoint(112, 222);
        expect(retunedCanvasObjects.length).toBe(0);
    });

    it("setGrid sets the repeating tile, grid, background on the Canvas DOM element", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

        expect(canvasDomElement.style.backgroundImage).toBe("url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMTEiIHk9IjExIiBzdHlsZT0iZmlsbDojNDI0MjQyIiAvPjwvc3ZnPg==)");
        expect(canvasDomElement.style.backgroundRepeat).toBe("repeat");
        expect(canvasDomElement.style.backgroundColor).toBe("rgb(255, 255, 255)");
    });


    it("emits object-added event", function() {

        const objAddedCallback = jasmine.createSpy("object-added");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('object-added', objAddedCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new CanvasObject(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            canvas, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        canvas.addObject(o);

        expect(objAddedCallback).toHaveBeenCalled();        
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

    it("emits object-translated event", function() {

        const translateCallback = jasmine.createSpy("translate-callback");
        
        const canvasElem = window.document.createElement('div');
        const canvas = new Canvas(canvasElem, window, pvWorkerMock);
        canvas.initTransformationHandlers();
        canvas.on('object-translated', translateCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new CanvasObject(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            canvas, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        canvas.addObject(o);

        const mouseDownEvent = new window.MouseEvent('mousedown', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        objTranslateHandleElem.dispatchEvent(mouseDownEvent);

        const mouseMoveEvent = new window.MouseEvent('mousemove', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'movementX': 111,
            'movementY': 111
        });
        canvasElem.dispatchEvent(mouseMoveEvent);

        expect(translateCallback).toHaveBeenCalled()
        
    });    

    it("emits object-resized event", function() {        
        const resizeCallback = jasmine.createSpy("resize-callback");
        
        const canvasElem = window.document.createElement('div');
        const canvas = new Canvas(canvasElem, window, pvWorkerMock);
        canvas.initTransformationHandlers();
        canvas.on('object-resized', resizeCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new CanvasObject(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            canvas, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        canvas.addObject(o);

        const mouseDownEvent = new window.MouseEvent('mousedown', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'which': 1
        });
        objResizeHandleElem.dispatchEvent(mouseDownEvent);

        const mouseMoveEvent = new window.MouseEvent('mousemove', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'movementX': 111,
            'movementY': 111
        });
        canvasElem.dispatchEvent(mouseMoveEvent);

        expect(resizeCallback).toHaveBeenCalled()
        
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

describe("Canvas connectors", function() {

    const makeAnchor = function(_id, _canvas) {
        const anchorElemWidth = 100;
        const anchorElemHeight = 200;

        const anchorElem = window.document.createElement('div');
        anchorElem.getBoundingClientRect = () => ({
            anchorElemWidth,
            anchorElemHeight,
            top: 0,
            left: 0,
            right: anchorElemWidth,
            bottom: anchorElemHeight,
          });

        return new ConnectorAnchor(_id, anchorElem, _canvas);
    };

    const makeCanvasObject = function(_id, _x, _y, _width, _height) {
        const domElem = window.document.createElement('div');
        domElem.getBoundingClientRect = () => ({
            _width,
            _height,
            top: _y,
            left: _x,
            right: _x + _width,
            bottom: _y + _height,
          });

        const o = new CanvasObject(
            _id,
            _x, 
            _y, 
            _width, 
            _height, 
            {}, 
            domElem, 
            [domElem], 
            [domElem]
        );

        return o;
    };

    const canvasDomElement = window.document.createElement('div');
    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };


    it("makeNewConnectorFromAnchors creates new Connector with correct ID", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);

        const connector = canvas.makeNewConnectorFromAnchors(anchorA, anchorB);

        expect(connector.getId()).toBe('objA-anchor:objB-anchor');

    });

    it("getObjectWithConnectorAnchor returns correct CanvasObject", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        canvas.addObject(objA);
        canvas.addObject(objB);        

        expect(canvas.getObjectWithConnectorAnchor("objB-anchor").getId()).toBe("objB");
    });    

    it("getObjectWithConnectorAnchor return null if CanvasObject doesn't exist", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        canvas.addObject(objA);
        canvas.addObject(objB);        

        expect(canvas.getObjectWithConnectorAnchor("objC-anchor")).toBe(null);
    });        

    it("getObjectsConnectedViaConnector returns connected Objects", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addObject(objA);
        canvas.addObject(objB);

        const connector = canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const objects = canvas.getObjectsConnectedViaConnector(connector.getId());

        expect(objects.length).toBe(2);
        expect(objects[0].getId()).toBe(objA.getId());
        expect(objects[1].getId()).toBe(objB.getId());
    });    

    it("getConnectorsBetweenObjects returns correct connector", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addObject(objA);
        canvas.addObject(objB);

        canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsBetObjects = canvas.getConnectorsBetweenObjects(objA, objB);

        expect(connectorsBetObjects.length).toBe(1);
        expect(connectorsBetObjects[0].getId()).toBe("objA-anchor:objB-anchor");
    });        

    it("getConnectorsConnectedToObject returns correct connector", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeCanvasObject("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeCanvasObject("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addObject(objA);
        canvas.addObject(objB);

        canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsConnectedToA = canvas.getConnectorsConnectedToObject(objA);
        const connectorsConnectedToB = canvas.getConnectorsConnectedToObject(objB);

        expect(connectorsConnectedToA.length).toBe(1);
        expect(connectorsConnectedToA[0].getId()).toBe("objA-anchor:objB-anchor");

        expect(connectorsConnectedToB.length).toBe(1);
        expect(connectorsConnectedToB[0].getId()).toBe("objA-anchor:objB-anchor");
        
    });         

});

describe("Canvas.initMultiObjectSelectionHandler", function() {
    var canvasDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        canvasDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    it("creates selection box DOM element", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initMultiObjectSelectionHandler();
        expect(canvasDomElement.getElementsByClassName("ia-selection-box").length).toBe(1);
    });

    it("creates selection box DOM element with given style classes", function() {
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initMultiObjectSelectionHandler(['style1', 'style2']);

        const elem = canvasDomElement.getElementsByClassName("ia-selection-box")[0];        
        expect(elem.classList.contains('style1')).toBe(true);
        expect(elem.classList.contains('style2')).toBe(true);
    });
});

describe("Canvas emits MULTIPLE_OBJECT_SELECTION_STARTED event", function() {
    var canvasDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        canvasDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("emits event on mousedown", function() {
        const selectionStartedCallback = jasmine.createSpy("selection-started-callback");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initMultiObjectSelectionHandler();
        canvas.on(CanvasEvent.MULTIPLE_OBJECT_SELECTION_STARTED, selectionStartedCallback);

        const event = new window.MouseEvent('mousedown', {
            'bubbles': true,
            'cancelable': true,
            'which': 1            
        });

        // Note that these events need to be dispatched from the SVG overlay element
        const svgOverlayElem = canvasDomElement.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        svgOverlayElem.dispatchEvent(event);

        expect(selectionStartedCallback).toHaveBeenCalled()        
    });

    it("emits event on touchstart", function() {
        jasmine.clock().install();
        const selectionStartedCallback = jasmine.createSpy("selection-started-callback");
        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.initMultiObjectSelectionHandler();
        canvas.on(CanvasEvent.MULTIPLE_OBJECT_SELECTION_STARTED, selectionStartedCallback);

        const event = new window.TouchEvent('touchstart', {
            'bubbles': true,
            'cancelable': true,
            'touches': [
                {
                    'pageX': 0,
                    'pageY': 0
                }
            ]          
        });

        // Note that these events need to be dispatched from the SVG overlay element
        const svgOverlayElem = canvasDomElement.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        svgOverlayElem.dispatchEvent(event);

        jasmine.clock().tick(1000);

        expect(selectionStartedCallback).toHaveBeenCalled()        
    });    
});
