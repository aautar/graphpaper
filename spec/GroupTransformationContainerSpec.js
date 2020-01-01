const jsdom = require("jsdom");
import {Canvas} from '../src/Canvas.js';
import {CanvasObject} from '../src/CanvasObject.js';
import {GroupTransformationContainer} from '../src/GroupTransformationContainer.js';
import {GRID_STYLE, Grid} from '../src/Grid.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

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
