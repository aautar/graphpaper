import { JSDOM } from 'jsdom';
import { Sheet } from '../src/Sheet.mjs';
import { Entity } from '../src/Entity.mjs';
import { ConnectorAnchor } from '../src/ConnectorAnchor.mjs';
import { GRID_STYLE, Grid } from '../src/Grid.mjs';
import { SheetEvent } from '../src/SheetEvent.mjs';
import { Point } from '../src/Point.mjs';

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

const sheet = {
    getGridSize: function() {
        return 12.0;
    }
  };

describe("Sheet", function() {
    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    const makeEntity = function(_id, _x, _y, _width, _height) {
        const domElem = window.document.createElement('div');
        const o = new Entity(
            _id,
            _x, 
            _y, 
            _width, 
            _height, 
            sheet, 
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
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        expect(sheet.getWidth()).toBe(1000);
    });

    it("getHeight returns canvas width", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        expect(sheet.getHeight()).toBe(2000);
    });    

    it("calcBoundingBox returns bounding box for entire canvas when empty", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        const bbox = sheet.calcBoundingBox();

        expect(bbox.getLeft()).toBe(0);
        expect(bbox.getTop()).toBe(0);
        expect(bbox.getBottom()).toBe(2000);
        expect(bbox.getRight()).toBe(1000);
    });        

    it("calcBoundingBox returns bounding box for area encompassing entities", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);

        const o1 = makeEntity("obj-1", 100, 200, 10, 20);
        const o2 = makeEntity("obj-2", 400, 200, 10, 20);
        sheet.addEntity(o1);
        sheet.addEntity(o2);

        const bbox = sheet.calcBoundingBox();

        expect(bbox.getLeft()).toBe(100);
        expect(bbox.getTop()).toBe(200);
        expect(bbox.getBottom()).toBe(220);
        expect(bbox.getRight()).toBe(410);
    });            

    it("snapToGrid snaps coordinate to grid", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        const snappedValue = sheet.snapToGrid(13);
        expect(snappedValue).toBe(sheet.getGridSize() - 1);
    });

    it("getEntityById returns added entity", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        var o = makeEntity("obj-123", 100, 200, 10, 20);
        sheet.addEntity(o);

        const retunedEntity = sheet.getEntityById('obj-123');
        expect(retunedEntity).toBe(o);
    });

    it("getEntityById returns null for missing entity", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        sheet.addEntity(o);

        const retunedEntity = sheet.getEntityById('id-for-non-existent-object');
        expect(retunedEntity).toBe(null);
    });  

    it("getEntitiesAroundPoint returns nearby object within box-radius of 1px", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);

        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        sheet.addEntity(o);

        const retunedEntities = sheet.getEntitiesAroundPoint(99, 201);

        expect(retunedEntities.length).toBe(1);
        expect(retunedEntities[0]).toBe(o);
    });    

    it("getEntitiesAroundPoint returns surrounding entity", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);

        var mockDomElem = {
            addEventListener: function() { }
        };

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        sheet.addEntity(o);

        const retunedEntities = sheet.getEntitiesAroundPoint(105, 210);

        expect(retunedEntities.length).toBe(1);
        expect(retunedEntities[0]).toBe(o);
    });        

    it("getEntitiesAroundPoint does not return entities outside box-radius of 1px", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);

        var o = makeEntity("obj-123", 100, 200, 10, 20);
        sheet.addEntity(o);

        const retunedEntities = sheet.getEntitiesAroundPoint(112, 222);
        expect(retunedEntities.length).toBe(0);
    });

    it("setGrid sets the repeating tile, grid, background on the Canvas DOM element", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(12.0, '#424242', GRID_STYLE.DOT));

        expect(sheetDomElement.style.backgroundImage).toBe("url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMTEiIHk9IjExIiBzdHlsZT0iZmlsbDojNDI0MjQyIiAvPjwvc3ZnPg==)");
        expect(sheetDomElement.style.backgroundRepeat).toBe("repeat");
        expect(sheetDomElement.style.backgroundColor).toBe("rgb(255, 255, 255)");
    });

    it("emits object-added event", function() {
        const objAddedCallback = jasmine.createSpy("object-added");
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();
        sheet.on(SheetEvent.ENTITY_ADDED, objAddedCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            sheet, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        sheet.addEntity(o);

        expect(objAddedCallback).toHaveBeenCalled();        
    });


    it("emits dblclick event", function() {
        const dblclickCallback = jasmine.createSpy("dblclick-callback");
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();
        sheet.on('dblclick', dblclickCallback);

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
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();
        sheet.on('click', clickCallback);

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
        const sheet = new Sheet(sheetElem, window, pvWorkerMock);
        sheet.initTransformationHandlers();
        sheet.on(SheetEvent.ENTITY_TRANSLATED, translateCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            sheet, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        sheet.addEntity(o);

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
        const sheet = new Sheet(sheetElem, window, pvWorkerMock);
        sheet.initTransformationHandlers();
        sheet.on(SheetEvent.ENTITY_RESIZED, resizeCallback);

        const objElement = window.document.createElement('div');
        const objTranslateHandleElem = window.document.createElement('div');
        const objResizeHandleElem = window.document.createElement('div');
        const o = new Entity(
            "obj1",
            "100", 
            "100", 
            "200", 
            "200", 
            sheet, 
            objElement, 
            [objTranslateHandleElem],
            [objResizeHandleElem]
        );
        
        sheet.addEntity(o);

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
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();
        sheet.on('dblclick', dblclickCallback);
        sheet.off('dblclick', dblclickCallback);

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
    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });    

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

        const entity = new Entity(
            _id,
            _x, 
            _y, 
            _width, 
            _height, 
            sheet, 
            domElem, 
            [domElem], 
            [domElem]
        );

        return entity;
    };

    const sheetDomElement = window.document.createElement('div');
    const document = window.document;

    const pvWorkerMock = {
        postMessage: function() { }
    };

    it("makeNewConnectorFromAnchors creates new Connector with correct ID", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);

        const connector = sheet.makeNewConnectorFromAnchors(anchorA, anchorB);

        expect(connector.getId()).toBe('objA-anchor:objB-anchor');
    });

    it("getEntityWithConnectorAnchor returns correct Entity", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        sheet.addEntity(objA);
        sheet.addEntity(objB);        

        expect(sheet.getEntityWithConnectorAnchor("objB-anchor").getId()).toBe("objB");
    });    

    it("getEntityWithConnectorAnchor return null if Entity doesn't exist", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor(anchorA);
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves        

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor(anchorB);
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves        

        sheet.addEntity(objA);
        sheet.addEntity(objB);        

        expect(sheet.getEntityWithConnectorAnchor("objC-anchor")).toBe(null);
    });        

    it("getEntitiesConnectedViaConnector returns connected entities", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        sheet.addEntity(objA);
        sheet.addEntity(objB);

        const connector = sheet.makeNewConnectorFromAnchors(anchorA, anchorB);
        const entities = sheet.getEntitiesConnectedViaConnector(connector.getId());

        expect(entities.length).toBe(2);
        expect(entities[0].getId()).toBe(objA.getId());
        expect(entities[1].getId()).toBe(objB.getId());
    });    

    it("getConnectorsBetweenEntities returns correct array of connectors", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        sheet.addEntity(objA);
        sheet.addEntity(objB);

        sheet.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsBetweenEntities = sheet.getConnectorsBetweenEntities(objA, objB);

        expect(connectorsBetweenEntities.length).toBe(1);
        expect(connectorsBetweenEntities[0].getId()).toBe("objA-anchor:objB-anchor");
    });

    it("getConnectorsInEntitySet returns correct array of connectors", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        const anchorC = makeAnchor("objC-anchor", sheet);
        const objC = makeEntity("objC", -500, -500, 100, 100);
        objC.addNonInteractableConnectorAnchor({});
        const objCAnchors = objC.getConnectorAnchors();
        objCAnchors[0] = anchorC; // overwrite, as typically objects create the anchors themselves        

        sheet.addEntity(objA);
        sheet.addEntity(objB);
        sheet.addEntity(objC);

        sheet.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsBetweenEntities = sheet.getConnectorsInEntitySet([objA, objB, objC]);

        expect(connectorsBetweenEntities.length).toBe(1);
        expect(connectorsBetweenEntities[0].getId()).toBe("objA-anchor:objB-anchor");
    });    

    it("getConnectorsConnectedToEntity returns correct connector", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initInteractionHandlers();

        const anchorA = makeAnchor("objA-anchor", sheet);
        const objA = makeEntity("objA", 100, 100, 100, 100);
        objA.addNonInteractableConnectorAnchor({});
        const objAAnchors = objA.getConnectorAnchors();
        objAAnchors[0] = anchorA; // overwrite, as typically objects create the anchors themselves

        const anchorB = makeAnchor("objB-anchor", sheet);
        const objB = makeEntity("objB", 500, 500, 100, 100);
        objB.addNonInteractableConnectorAnchor({});
        const objBAnchors = objB.getConnectorAnchors();
        objBAnchors[0] = anchorB; // overwrite, as typically objects create the anchors themselves

        sheet.addEntity(objA);
        sheet.addEntity(objB);

        sheet.makeNewConnectorFromAnchors(anchorA, anchorB);
        const connectorsConnectedToA = sheet.getConnectorsConnectedToEntity(objA);
        const connectorsConnectedToB = sheet.getConnectorsConnectedToEntity(objB);

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
        jasmine.clock().install();
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });    

    it("creates selection box DOM element", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initMultiEntitySelectionHandler();
        expect(sheetDomElement.getElementsByClassName("ia-selection-box").length).toBe(1);
    });

    it("creates selection box DOM element with given style classes", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initMultiEntitySelectionHandler(['style1', 'style2']);

        const elem = sheetDomElement.getElementsByClassName("ia-selection-box")[0];        
        expect(elem.classList.contains('style1')).toBe(true);
        expect(elem.classList.contains('style2')).toBe(true);
    });
});

describe("Canvas emits MULTIPLE_OBJECT_SELECTION_STARTED event", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        jasmine.clock().install();
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    afterEach(function () {
        jasmine.clock().uninstall();
    });        

    it("emits event on mousedown", function() {
        const selectionStartedCallback = jasmine.createSpy("selection-started-callback");
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initMultiEntitySelectionHandler();
        sheet.on(SheetEvent.MULTIPLE_ENTITY_SELECTION_STARTED, selectionStartedCallback);

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
        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.initMultiEntitySelectionHandler();
        sheet.on(SheetEvent.MULTIPLE_ENTITY_SELECTION_STARTED, selectionStartedCallback);

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

describe("Sheet.getTransformMatrixCss", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    it("returns string for CSS transform", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.translate(100, 200);
        sheet.scale(0.5, false);
        sheet.applyTransform();

        const cssValue = sheet.getTransformMatrixCss();
        expect(cssValue).toBe("matrix3d(0.5,0,0,0,0,0.5,0,0,0,0,0.5,1,50,100,0,1)");
    });
});

describe("Sheet.transformDomRectToPageSpaceRect", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');

        Object.defineProperties(window.HTMLElement.prototype, {
            offsetLeft: {
              get () {
                return this.marginLeft
              },
              set (offset) {
                this.marginLeft = offset
              }
            }
        });

        Object.defineProperties(window.HTMLElement.prototype, {
            offsetTop: {
              get () {
                return this.marginTop
              },
              set (offset) {
                this.marginTop = offset
              }
            }
        });

        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    it("returns transformed rectangle", function() {
        sheetDomElement.offsetLeft = 0;
        sheetDomElement.offsetTop = 0;

        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.scale(0.5, false);
        sheet.applyTransform();

        // DOMRect mock
        const elemDomRect = {
            "left": 10,
            "right": 20,
            "top": 10,
            "bottom": 20
        };

        const r = sheet.transformDomRectToPageSpaceRect(elemDomRect);
        expect(r.getLeft()).toBe(20);
        expect(r.getTop()).toBe(20);
        expect(r.getRight()).toBe(40);
        expect(r.getBottom()).toBe(40);
    });

    it("returns transformed rectangle for offset sheet", function() {
        sheetDomElement.offsetLeft = 100;
        sheetDomElement.offsetTop = 100;

        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.scale(0.5, false);
        sheet.applyTransform();

        // DOMRect mock
        const elemDomRect = {
            "left": 110,
            "right": 120,
            "top": 110,
            "bottom": 120
        };

        const r = sheet.transformDomRectToPageSpaceRect(elemDomRect);
        expect(r.getLeft()).toBe(120);
        expect(r.getTop()).toBe(120);
        expect(r.getRight()).toBe(140);
        expect(r.getBottom()).toBe(140);
    });

    it("returns transformed rectangle for scrolled page", function() {
        window.pageXOffset = 100;
        window.pageYOffset = 0;
        sheetDomElement.offsetLeft = 0;
        sheetDomElement.offsetTop = 0;

        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.scale(0.5, false);
        sheet.applyTransform(); 

        // DOMRect mock
        const elemDomRect = {
            "left": 10,
            "right": 20,
            "top": 10,
            "bottom": 20
        };

        const r = sheet.transformDomRectToPageSpaceRect(elemDomRect);
        expect(r.getLeft()).toBe(220);
        expect(r.getTop()).toBe(20);
        expect(r.getRight()).toBe(240);
        expect(r.getBottom()).toBe(40);
    });    
});

describe("Sheet.transformPointFromPageSpaceToSheetSpace", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements

        sheetDomElement = window.document.createElement('div');
        sheetDomElement.offsetLeft = 100;
        sheetDomElement.offsetTop = 50;

        pvWorkerMock = {
            postMessage: function() { }
        };    
    });

    it("returns point transformed to Sheet space", function() {
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        const sheetSpacePt = sheet.transformPointFromPageSpaceToSheetSpace(new Point(200, 400));
        
        expect(sheetSpacePt.getX()).toBe(100);
        expect(sheetSpacePt.getY()).toBe(350);
    });
});
