const jsdom = require("jsdom");
import {CanvasObject} from '../src/CanvasObject.js';
import {ConnectorAnchor} from '../src/ConnectorAnchor'
import {Connector} from '../src/Connector'

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;
global.window = window;

describe("ConnectorAnchor.getId", function() {

    it("creates an id = sorted ids of anchors", function() {

        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, {});        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, {});        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        expect(connector.getId()).toBe(`connector-anchor-end-987:connector-anchor-start-123`);
    });

});

describe("ConnectorAnchor.getAnchorStart", function() {

    it("returns starting ConnectorAnchor object", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, {});        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, {});        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');     
        
        expect(connector.getAnchorStart()).toBe(anchorStart);
    });

});

describe("ConnectorAnchor.getAnchorEnd", function() {

    it("returns ending ConnectorAnchor object", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, {});        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, {});        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');     
        
        expect(connector.getAnchorEnd()).toBe(anchorEnd);
    });

});

describe("ConnectorAnchor.removePathElement", function() {

    it("remove SVG path element from DOM", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, {});        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, {});        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');    
        connector.appendPathToContainerDomElement(); 
        
        expect(containerDomElem.getElementsByTagName('path').length).toBe(1);

        connector.removePathElement();

        expect(containerDomElem.getElementsByTagName('path').length).toBe(0);
    });

});
