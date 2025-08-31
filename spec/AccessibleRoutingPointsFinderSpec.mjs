import { AccessibleRoutingPointsFinder } from '../src/AccessibleRoutingPointsFinder.mjs'
import { Entity } from '../src/Entity.mjs';
import { JSDOM } from 'jsdom';
import { Rectangle } from '../src/Rectangle.mjs';
import { Point } from '../src/Point.mjs';

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;

const makeEntityDescriptor = function(_id, _x, _y, _width, _height) {
    const sheet = {
        getGridSize: function () {
            return 12.0;
        },
        transformDomRectToPageSpaceRect: function(_domRect) {
            return new Rectangle(_x, _y, _x+_width, _y+_height);
        },
        getSheetOffset: function() {
            return new Point(0,0);
        }
    };

    const e = new Entity(
        _id,
        _x, 
        _y, 
        _width, 
        _height, 
        sheet, 
        window.document.createElement('div'), 
        [window.document.createElement('div')], 
        [window.document.createElement('div')]
    );

    e.addNonInteractableConnectorAnchor(window.document.createElement('div'));

    return e.getDescriptor();
};


describe("AccessibleRoutingPointsFinder.find", function() {
    it("return correct result for empty set of objects", function() {
        const result = AccessibleRoutingPointsFinder.find([], [], 12.0);

        expect(result.connectorAnchorToNumValidRoutingPoints.constructor.name).toBe(Map.name);
        expect(result.connectorAnchorToNumValidRoutingPoints.size).toBe(0);

        expect(result.accessibleRoutingPoints.constructor.name).toBe('PointSet');
        expect(result.accessibleRoutingPoints.count()).toBe(0);
    });

    it("returns accessible routing points", function() {
        const e1 = makeEntityDescriptor("e1", 0, 0, 50, 50);

        const result = AccessibleRoutingPointsFinder.find([e1], [], 12.0);
        
        expect(result.accessibleRoutingPoints.count()).toBe(4);
        expect(result.accessibleRoutingPoints.contains(new Point(25, -12))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(-12, 25))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(25, 62))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(62, 25))).toBe(true);
    });
    
    it("does not return routing points that are occluded", function() {
        const e1 = makeEntityDescriptor("e1", 0, 0, 50, 50);
        const occluder = makeEntityDescriptor("occluder", -100, -100, 500, 500);

        const result = AccessibleRoutingPointsFinder.find([e1], [occluder], 12.0);

        expect(result.accessibleRoutingPoints.count()).toBe(0);
    });

    it("returns accessible routing points, where points are encapsulated by Entity where isRoutingAroundBoundingRectAllowed == false", function() {
        const e1 = makeEntityDescriptor("e1", 0, 0, 50, 50);

        const nonOccluder = makeEntityDescriptor("non-occluder", -100, -100, 500, 500);
        nonOccluder.isRoutingAroundBoundingRectAllowed = false;

        const result = AccessibleRoutingPointsFinder.find([e1], [nonOccluder], 12.0);

        expect(result.accessibleRoutingPoints.count()).toBe(4);
        expect(result.accessibleRoutingPoints.contains(new Point(25, -12))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(-12, 25))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(25, 62))).toBe(true);
        expect(result.accessibleRoutingPoints.contains(new Point(62, 25))).toBe(true);
    });
});
