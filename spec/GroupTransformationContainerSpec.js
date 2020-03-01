const jsdom = require("jsdom");
import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';
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
    var canvasDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        canvasDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("creates transformation rect DOM element", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        const gtc = new GroupTransformationContainer(canvas, []);
        canvas.attachGroupTransformationContainer(gtc);

        expect(canvasDomElement.getElementsByClassName("ia-group-transformation-container").length).toBe(1);
    });

    it("creates transformation rect DOM element with given style classes", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        const gtc = new GroupTransformationContainer(canvas, [], ['style1', 'style2']);
        canvas.attachGroupTransformationContainer(gtc);
        
        const gtcDomElem = canvasDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.classList.contains('style1')).toBe(true);
        expect(gtcDomElem.classList.contains('style2')).toBe(true);
    });

    it("creates transformation rect DOM element with correct size", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        canvas.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new CanvasObject(
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

        const gtc = new GroupTransformationContainer(canvas, groupObjects);
        canvas.attachGroupTransformationContainer(gtc);

        const gtcDomElem = canvasDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.left).toBe('0px');
        expect(gtcDomElem.style.top).toBe('0px');        
        expect(gtcDomElem.style.width).toBe('10px');
        expect(gtcDomElem.style.height).toBe('20px');
    });    


    it("creates transformation rect DOM element with correct adjusted size", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        canvas.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new CanvasObject(
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

        const gtc = new GroupTransformationContainer(canvas, groupObjects, [], 10.0);
        canvas.attachGroupTransformationContainer(gtc);

        const gtcDomElem = canvasDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.left).toBe('-10px');
        expect(gtcDomElem.style.top).toBe('-10px');        
        expect(gtcDomElem.style.width).toBe('30px');
        expect(gtcDomElem.style.height).toBe('40px');
    });

    it("displays group transformation rect DOM element when group has 1+ objects", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        canvas.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new CanvasObject(
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

        const gtc = new GroupTransformationContainer(canvas, groupObjects, [], 10.0);
        canvas.attachGroupTransformationContainer(gtc);

        const gtcDomElem = canvasDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.display).toBe('block');
    });    

    it("does not display group transformation rect DOM element when group has 0 objects", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        canvas.initMultiObjectSelectionHandler();
        
        const gtc = new GroupTransformationContainer(canvas, [], [], 10.0);
        canvas.attachGroupTransformationContainer(gtc);

        const gtcDomElem = canvasDomElement.getElementsByClassName("ia-group-transformation-container")[0];
        expect(gtcDomElem.style.display).toBe('none');
    });        
});

describe("GroupTransformationContainer.translateByOffset", function() {
    var canvasDomElement = null;
    var pvWorkerMock = null;

    beforeEach(function() {
        window.document.body.innerHTML = ""; // should have a way to destroy canvas owned DOM elements
        canvasDomElement = window.document.createElement('div');
        pvWorkerMock = {
            postMessage: function() { }
        };    
    });    

    it("translates and snaps objects to grid", function() {        
        const canvas = new Canvas(canvasDomElement, window, pvWorkerMock);
        canvas.setGrid(new Grid(8.0, '#424242', GRID_STYLE.DOT));
        canvas.initMultiObjectSelectionHandler();
        
        const groupObjects = [
            new CanvasObject(
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

        const gtc = new GroupTransformationContainer(canvas, groupObjects);
        gtc.translateByOffset(9, 9);

        expect(groupObjects[0].getX()).toBe(7);
        expect(groupObjects[0].getY()).toBe(7);
    });
});
