const jsdom = require("jsdom");
import {Sheet} from '../src/Sheet.js';
import {Entity} from '../src/Entity.js';
import {GroupTransformationContainer} from '../src/GroupTransformationContainer.js';
import {GRID_STYLE, Grid} from '../src/Grid.js';

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

describe("GroupTransformationContainer", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy sheet owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("creates transformation rect DOM element", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        const gtc = new GroupTransformationContainer(sheet, []);
        sheet.attachGroupTransformationContainer(gtc);

        expect(sheetDomElement.getElementsByClassName("ia-group-transformation-container").length).toBe(1);
    });

    it("creates transformation rect DOM element with given style classes", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        const gtc = new GroupTransformationContainer(sheet, [], ['style1', 'style2']);
        sheet.attachGroupTransformationContainer(gtc);
        
        const gtcDomElem = sheetDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.classList.contains('style1')).toBe(true);
        expect(gtcDomElem.classList.contains('style2')).toBe(true);
    });

    it("creates transformation rect DOM element with correct size", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        sheet.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new Entity(
                "obj-123",
                0, 
                0, 
                10, 
                20, 
                {}, 
                window.document.createElement('div'), 
                [window.document.createElement('div')], 
                [window.document.createElement('div')]
            )
        ];

        const gtc = new GroupTransformationContainer(sheet, groupObjects);
        sheet.attachGroupTransformationContainer(gtc);

        const gtcDomElem = sheetDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.left).toBe('0px');
        expect(gtcDomElem.style.top).toBe('0px');        
        expect(gtcDomElem.style.width).toBe('10px');
        expect(gtcDomElem.style.height).toBe('20px');
    });    


    it("creates transformation rect DOM element with correct adjusted size", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        sheet.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new Entity(
                "obj-123",
                0, 
                0, 
                10, 
                20, 
                {}, 
                window.document.createElement('div'), 
                [window.document.createElement('div')], 
                [window.document.createElement('div')]
            )
        ];

        const gtc = new GroupTransformationContainer(sheet, groupObjects, [], 10.0);
        sheet.attachGroupTransformationContainer(gtc);

        const gtcDomElem = sheetDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.left).toBe('-10px');
        expect(gtcDomElem.style.top).toBe('-10px');        
        expect(gtcDomElem.style.width).toBe('30px');
        expect(gtcDomElem.style.height).toBe('40px');
    });

    it("displays group transformation rect DOM element when group has 1+ objects", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        sheet.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new Entity(
                "obj-123",
                0, 
                0, 
                10, 
                20, 
                {}, 
                window.document.createElement('div'), 
                [window.document.createElement('div')], 
                [window.document.createElement('div')]
            )
        ];

        const gtc = new GroupTransformationContainer(sheet, groupObjects, [], 10.0);
        sheet.attachGroupTransformationContainer(gtc);

        const gtcDomElem = sheetDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.display).toBe('block');
    });    

    it("does not display group transformation rect DOM element when group has 0 objects", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        sheet.initMultiObjectSelectionHandler();
        
        const gtc = new GroupTransformationContainer(sheet, [], [], 10.0);
        sheet.attachGroupTransformationContainer(gtc);

        const gtcDomElem = sheetDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.display).toBe('none');
    });        
});

describe("GroupTransformationContainer.translateByOffset", function() {
    var sheetDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        sheetDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("translates and snaps objects to grid", function() {        
        const sheet = new Sheet(sheetDomElement, window, pvWorkerMock);
        sheet.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        sheet.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new Entity(
                "obj-123",
                0, 
                0, 
                10, 
                20, 
                {}, 
                window.document.createElement('div'), 
                [window.document.createElement('div')], 
                [window.document.createElement('div')]
            )
        ];

        const gtc = new GroupTransformationContainer(sheet, groupObjects);
        gtc.translateByOffset(9, 9);

        expect(groupObjects[0].getX()).toBe(7);
        expect(groupObjects[0].getY()).toBe(7);
    });
});
