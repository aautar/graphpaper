const jsdom = require("jsdom");
import {Sheet} from '../src/Sheet.js';
import {Entity} from '../src/Entity.js';
import {ConnectorAnchor} from '../src/ConnectorAnchor.js';
import {GRID_STYLE,Grid} from '../src/Grid.js';
import {SheetEvent} from '../src/SheetEvent.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

global.Worker = function() { 
    this.postMessage = function() { }
};

global.Blob = function() {

};

global.URL = {
    createObjectURL: () => { return '#'; }
};

jasmine.clock().install();

describe("Sheet", function() {

    const makeEntity = function(_id, _x, _y, _width, _height) {
        const domElem = window.document.createElement('div');
        const o = new Entity(
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

    const sheetDomElement = window.document.createElement('div');
    Object.defineProperty(sheetDomElement, 'offsetWidth', {value: 1000});
    Object.defineProperty(sheetDomElement, 'offsetHeight', {value: 2000});

    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };

    it("getWidth returns canvas width", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        expect(canvas.getWidth()).toBe(1000);
    });

    it("getHeight returns canvas width", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        expect(canvas.getHeight()).toBe(2000);
    });    

    it("calcBoundingBox returns bounding box for entire canvas when empty", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        const bbox = canvas.calcBoundingBox();

        expect(bbox.getLeft()).toBe(0);
        expect(bbox.getTop()).toBe(0);
        expect(bbox.getBottom()).toBe(2000);
        expect(bbox.getRight()).toBe(1000);
    });        

    it("calcBoundingBox returns bounding box for area encompassing entities", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);

        const o1 = makeEntity("obj-1", 100, 200, 10, 20);
        const o2 = makeEntity("obj-2", 400, 200, 10, 20);
        canvas.addEntity(o1);
        canvas.addEntity(o2);

        const bbox = canvas.calcBoundingBox();

        expect(bbox.getLeft()).toBe(100);
        expect(bbox.getTop()).toBe(200);
        expect(bbox.getBottom()).toBe(220);
        expect(bbox.getRight()).toBe(410);
    });            

    it("snapToGrid snaps coordinate to grid", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        const snappedValue = canvas.snapToGrid(13);
        expect(snappedValue).toBe(canvas.getGridSize() - 1);
    });

    it("getEntityById returns added entity", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        var o = makeEntity("obj-123", 100, 200, 10, 20);
        canvas.addEntity(o);

        const retunedEntity = canvas.getEntityById('obj-123');
        expect(retunedEntity).toBe(o);
    });

    it("getEntityById returns null for missing entity", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        canvas.addEntity(o);

        const retunedEntity = canvas.getEntityById('id-for-non-existent-object');
        expect(retunedEntity).toBe(null);
    });  

    it("getEntitiesAroundPoint returns nearby object within box-radius of 1px", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);

        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        canvas.addEntity(o);

        const retunedEntities = canvas.getEntitiesAroundPoint(99, 201);

        expect(retunedEntities.length).toBe(1);
        expect(retunedEntities[0]).toBe(o);
    });    

    it("getEntitiesAroundPoint returns surrounding entity", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);

        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        canvas.addEntity(o);

        const retunedEntities = canvas.getEntitiesAroundPoint(105, 210);

        expect(retunedEntities.length).toBe(1);
        expect(retunedEntities[0]).toBe(o);
    });        

    it("getEntitiesAroundPoint does not return entities outside box-radius of 1px", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        canvas.addEntity(o);

        const retunedEntities = canvas.getEntitiesAroundPoint(112, 222);
        expect(retunedEntities.length).toBe(0);
    });

    it("setGrid sets the repeating tile, grid, background on the Canvas DOM element", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

        expect(sheetDomElement.style.backgroundImage).toBe("url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMTEiIHk9IjExIiBzdHlsZT0iZmlsbDojNDI0MjQyIiAvPjwvc3ZnPg==)");
        expect(sheetDomElement.style.backgroundRepeat).toBe("repeat");
        expect(sheetDomElement.style.backgroundColor).toBe("rgb(255, 255, 255)");
    });

    it("emits object-added event", function() {

        const objAddedCallback = jasmine.createSpy("object-added");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('object-added', objAddedCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
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
        
        canvas.addEntity(o);

        expect(objAddedCallback).toHaveBeenCalled();        
    });


    it("emits dblclick event", function() {
        const dblclickCallback = jasmine.createSpy("dblclick-callback");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('dblclick', dblclickCallback);

        const event = new window.MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        sheetDomElement.dispatchEvent(event);

        expect(dblclickCallback).toHaveBeenCalled()
        
    });

    it("emits click event", function() {
        const clickCallback = jasmine.createSpy("click-callback");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('click', clickCallback);

        const event = new window.MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        sheetDomElement.dispatchEvent(event);

        expect(clickCallback).toHaveBeenCalled()
        
    });    

    it("emits object-translated event", function() {

        const translateCallback = jasmine.createSpy("translate-callback");
        
        const sheetElem = window.document.createElement('div');
        const canvas = new Sheet(sheetElem, window, pvWorkerMock);
        canvas.initTransformationHandlers();
        canvas.on('object-translated', translateCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
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
        
        canvas.addEntity(o);

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
        sheetElem.dispatchEvent(mouseMoveEvent);

        expect(translateCallback).toHaveBeenCalled()
        
    });    

    it("emits object-resized event", function() {        
        const resizeCallback = jasmine.createSpy("resize-callback");
        
        const sheetElem = window.document.createElement('div');
        const canvas = new Sheet(sheetElem, window, pvWorkerMock);
        canvas.initTransformationHandlers();
        canvas.on('object-resized', resizeCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
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
        
        canvas.addEntity(o);

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
        sheetElem.dispatchEvent(mouseMoveEvent);

        expect(resizeCallback).toHaveBeenCalled()
        
    });    
        

    it("off removes handler", function() {
        const dblclickCallback = jasmine.createSpy("dblclick-callback");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();
        canvas.on('dblclick', dblclickCallback);
        canvas.off('dblclick', dblclickCallback);

        const event = new window.MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        sheetDomElement.dispatchEvent(event);

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

    const makeEntity = function(_id, _x, _y, _width, _height) {
        const domElem = window.document.createElement('div');
        domElem.getBoundingClientRect = () => ({
            _width,
            _height,
            top: _y,
            left: _x,
            right: _x + _width,
            bottom: _y + _height,
          });

        const o = new Entity(
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

    const sheetDomElement = window.document.createElement('div');
    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };

    it("makeNewConnectorFromAnchors creates new Connector with correct ID", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);

        const connector = canvas.makeNewConnectorFromAnchors(anchorA, anchorB);

        expect(connector.getId()).toBe('objA-anchor:objB-anchor');

    });

    it("getEntityWithConnectorAnchor returns correct Entity", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        canvas.addEntity(objA);
        canvas.addEntity(objB);        

        expect(canvas.getEntityWithConnectorAnchor("objB-anchor").getId()).toBe("objB");
    });    

    it("getEntityWithConnectorAnchor return null if Entity doesn't exist", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        canvas.addEntity(objA);
        canvas.addEntity(objB);        

        expect(canvas.getEntityWithConnectorAnchor("objC-anchor")).toBe(null);
    });        

    it("getEntitiesConnectedViaConnector returns connected entities", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addEntity(objA);
        canvas.addEntity(objB);

        const connector = canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const entities = canvas.getEntitiesConnectedViaConnector(connector.getId());

        expect(entities.length).toBe(2);
        expect(entities[0].getId()).toBe(objA.getId());
        expect(entities[1].getId()).toBe(objB.getId());
    });    

    it("getConnectorsBetweenEntities returns correct connector", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addEntity(objA);
        canvas.addEntity(objB);

        canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsBetweenEntities = canvas.getConnectorsBetweenEntities(objA, objB);

        expect(connectorsBetweenEntities.length).toBe(1);
        expect(connectorsBetweenEntities[0].getId()).toBe("objA-anchor:objB-anchor");
    });        

    it("getConnectorsConnectedToEntity returns correct connector", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", canvas);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", canvas);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        canvas.addEntity(objA);
        canvas.addEntity(objB);

        canvas.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsConnectedToA = canvas.getConnectorsConnectedToEntity(objA);
        const connectorsConnectedToB = canvas.getConnectorsConnectedToEntity(objB);

        expect(connectorsConnectedToA.length).toBe(1);
        expect(connectorsConnectedToA[0].getId()).toBe("objA-anchor:objB-anchor");

        expect(connectorsConnectedToB.length).toBe(1);
        expect(connectorsConnectedToB[0].getId()).toBe("objA-anchor:objB-anchor");
        
    });         

});

describe("Canvas.initMultiEntitySelectionHandler", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    it("creates selection box DOM element", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initMultiEntitySelectionHandler();
        expect(sheetDomElement.getElementsByClassName("ia-selection-box").length).toBe(1);
    });

    it("creates selection box DOM element with given style classes", function() {
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initMultiEntitySelectionHandler(['style1', 'style2']);

        const elem = sheetDomElement.getElementsByClassName("ia-selection-box")[0];        
        expect(elem.classList.contains('style1')).toBe(true);
        expect(elem.classList.contains('style2')).toBe(true);
    });
});

describe("Canvas emits MULTIPLE_OBJECT_SELECTION_STARTED event", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("emits event on mousedown", function() {
        const selectionStartedCallback = jasmine.createSpy("selection-started-callback");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initMultiEntitySelectionHandler();
        canvas.on(SheetEvent.MULTIPLE_OBJECT_SELECTION_STARTED, selectionStartedCallback);

        const event = new window.MouseEvent('mousedown', {
            'bubbles': true,
            'cancelable': true,
            'which': 1            
        });

        // Note that these events need to be dispatched from the SVG overlay element
        const svgOverlayElem = sheetDomElement.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        svgOverlayElem.dispatchEvent(event);

        expect(selectionStartedCallback).toHaveBeenCalled()        
    });

    it("emits event on touchstart", function() {
        const selectionStartedCallback = jasmine.createSpy("selection-started-callback");
        
        const canvas = new Sheet(sheetDomElement, window, pvWorkerMock);
        canvas.initMultiEntitySelectionHandler();
        canvas.on(SheetEvent.MULTIPLE_OBJECT_SELECTION_STARTED, selectionStartedCallback);

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
        const svgOverlayElem = sheetDomElement.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        svgOverlayElem.dispatchEvent(event);

        jasmine.clock().tick(1000);

        expect(selectionStartedCallback).toHaveBeenCalled();      
    });    
});
