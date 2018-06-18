const jsdom = require("jsdom");
import {CanvasObject} from '../src/CanvasObject.js';
import {ConnectorAnchor} from '../src/ConnectorAnchor'

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

describe("ConnectorAnchor.getWidth, ConnectorAnchor.getHeight", function() {

    it("computes dimensions using getBoundingClientRect", function() {

        const obj = new CanvasObject(
            'obj1',
            0, 
            0, 
            1000, 
            1000, 
            {}, 
            window.document.createElement('div'), 
            window.document.createElement('div'), 
            window.document.createElement('div')
        );

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

        const anchor = new ConnectorAnchor(anchorElem, obj, {});

        expect(anchor.getWidth()).toBe(100);
        expect(anchor.getHeight()).toBe(200);
    });
});