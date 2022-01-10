const jsdom = require("jsdom");
import {Entity} from '../src/Entity.js';
import {ConnectorAnchor} from '../src/ConnectorAnchor'
import {Connector} from '../src/Connector'
import { Point } from '../src/Point.js';
import { ConnectorRoutingAlgorithm } from '../src/ConnectorRoutingAlgorithm.js';

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;
global.window = window;

const sheet = {
    getGridSize: function() {
        return 12.0;
    }
};

describe("Connector.getId", function() {
    it("creates an id = sorted ids of anchors", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        expect(connector.getId()).toBe(`connector-anchor-end-987:connector-anchor-start-123`);
    });
});

describe("Connector.getAnchorStart", function() {
    it("returns starting ConnectorAnchor object", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');     
        
        expect(connector.getAnchorStart()).toBe(anchorStart);
    });
});

describe("Connector.getAnchorEnd", function() {
    it("returns ending ConnectorAnchor object", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');     
        
        expect(connector.getAnchorEnd()).toBe(anchorEnd);
    });
});

describe("Connector.removePathElement", function() {
    it("remove SVG path element from DOM", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');    
        connector.appendPathToContainerDomElement(); 
        
        expect(containerDomElem.getElementsByTagName('path').length).toBe(2); // 2 b/c we have the path and interaction elements

        connector.removePathElement();

        expect(containerDomElem.getElementsByTagName('path').length).toBe(0);
    });
});

describe("Connector.getLength", function() {
    it("returns euclidean length of all path lines", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        connector.updatePathPoints([
            new Point(1607, 757),
            new Point(1629, 757),
            new Point(2003, 925),
            new Point(2494, 925),
            new Point(2534, 781),
            new Point(2556, 781)
        ]);

        connector.refresh("M1607 757L1629 757 L2003 925 L2494 925 L2534 781 L2556 781");

        const connectorLength = connector.getLength();

        expect(connectorLength).toBe(1094.4523335381552);
    });
});

describe("Connector.getMidpoint", function() {
    it("returns midpoint of path consisting of single segment", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        connector.updatePathPoints(
            [
                new Point(100, 100),
                new Point(500, 500),
            ]
        );

        connector.refresh(
            "M100 100L500 500"
        );

        const midpoint = connector.getMidpoint();
        expect(midpoint.toString()).toBe(`300 300`);
    });

    it("returns midpoint of path consisting of multiple segments", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        connector.updatePathPoints(
            [
                new Point(100, 100),
                new Point(100, 90),
                new Point(180, 90),
                new Point(180, 100),
            ]
        );

        connector.refresh(
            "M100 100L100 90 L180 90 L180 100"
        );

        const midpoint = connector.getMidpoint();
        expect(midpoint.toString()).toBe(`140 90`);
    });
});


describe("Connector.getMidpointDirection", function() {
    it("returns direction of midpoint segment", function() {
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');

        connector.updatePathPoints(
            [
                new Point(100, 100),
                new Point(100, 90),
                new Point(180, 90),
                new Point(180, 100),
            ]
        );
        
        connector.refresh(
            "M100 100L100 90 L180 90 L180 100"
        );

        const mpDir = connector.getMidpointDirection();
        expect(mpDir.toString()).toBe(`1 0`);
    });
});

describe("Connector.on", function() {
    it("adds handler", function() {
        const clickCallback = jasmine.createSpy("click-callback");
        
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');

        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');    
        connector.appendPathToContainerDomElement();
        connector.on('connector-click', clickCallback);

        const event = new window.MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        /**
         * @todo flaky, need to make sure we consistently target the interaction element
         */
        containerDomElem.getElementsByTagNameNS("http://www.w3.org/2000/svg", "path")[1].dispatchEvent(event);

        expect(clickCallback).toHaveBeenCalled();        
    }); 
});

describe("Connector.off", function() {
    it("removes handler", function() {
        const clickCallback = jasmine.createSpy("click-callback");
        
        const anchorStartElem = window.document.createElement('div');
        const anchorStart = new ConnectorAnchor('connector-anchor-start-123', anchorStartElem, sheet);        

        const anchorEndElem = window.document.createElement('div');
        const anchorEnd = new ConnectorAnchor('connector-anchor-end-987', anchorEndElem, sheet);        

        const containerDomElem = window.document.createElement('div');
        
        const connector = new Connector(anchorStart, anchorEnd, containerDomElem, '#fff', '2px');    
        connector.appendPathToContainerDomElement();
        connector.on('connector-click', clickCallback);
        connector.off('connector-click', clickCallback);

        const event = new window.MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        containerDomElem.getElementsByTagNameNS("http://www.w3.org/2000/svg", "path")[0].dispatchEvent(event);

        expect(clickCallback).not.toHaveBeenCalled();        
    }); 
});

describe("Connector.getDescriptor", function() {
    it("returns correct descriptor", function() {
        const expectedDescriptor = {
            id: "anchor-end-id:anchor-start-id",
            anchor_start_centroid_arr: [0,0],
            anchor_end_centroid_arr: [100,100],
            marker_start_size: 0,
            marker_end_size: 0,
            curvature_px: 0,
            routing_algorithm: ConnectorRoutingAlgorithm.ASTAR_THETA_WITH_ROUTE_OPTIMIZATION
        };

        const anchorStart = {
            getId: function() {
                return "anchor-start-id";
            },

            getCentroid: function() {
                return new Point(0,0);
            }
        };

        const anchorEnd = {
            getId: function() {
                return "anchor-end-id";
            },

            getCentroid: function() {
                return new Point(100,100);
            }
        };

        const containerDomElem = window.document.createElement('div');
        const connector = new Connector(anchorStart, anchorEnd, containerDomElem);

        expect(connector.getDescriptor()).toEqual(expectedDescriptor);
    });
});
