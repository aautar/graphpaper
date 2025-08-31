import { Entity } from '../src/Entity.mjs';
import { Line } from '../src/Line.mjs';
import { EntityDescriptorParser } from "../src/EntityDescriptorParser.mjs";
import { Point } from '../src/Point.mjs';

const sheet = {
    getGridSize: function () {
        return 12.0;
    },
};

/**
 * Should this be a method in LineSet?
 * 
 * @param {LineSet} _lineSet 
 * @param {Line} _line 
 */
const doesLineSetContainsLine = function(_lineSet, _line) {
    const lines = _lineSet.toArray();
    for(let i=0; i<lines.length; i++) {

        // reverse of start,end point is also a valid line
        if(lines[i].getStartPoint().toString() === _line.getStartPoint().toString() && lines[i].getEndPoint().toString() === _line.getEndPoint().toString()) {
            return true;
        }
    }

    return false;
};

describe("EntityDescriptorParser.extractBoundaryLines", function () {
    it("returns LineSet that includes lines of bounding rectangle", function () {
        const et = new Entity(
            "obj-123",
            100,
            200,
            10,
            20,
            sheet,
            window.document.createElement('div'),
            [window.document.createElement('div')],
            [window.document.createElement('div')]
        );

        const boundaryLines = EntityDescriptorParser.extractBoundaryLines(et.getDescriptor());

        expect(boundaryLines.count()).toBe(4);
        expect(doesLineSetContainsLine(boundaryLines, new Line(new Point(100,200), new Point(110,200)))).toBe(true);
        expect(doesLineSetContainsLine(boundaryLines, new Line(new Point(110,200), new Point(110,220)))).toBe(true);
        expect(doesLineSetContainsLine(boundaryLines, new Line(new Point(110,220), new Point(100,220)))).toBe(true);
        expect(doesLineSetContainsLine(boundaryLines, new Line(new Point(100,220), new Point(100,200)))).toBe(true);
    });

    it("returns LineSet that does not include lines of bounding rectangle, if Entity does not allow routing around bounding rectangle", function () {
        const et = new Entity(
            "obj-123",
            100,
            200,
            10,
            20,
            sheet,
            window.document.createElement('div'),
            [window.document.createElement('div')],
            [window.document.createElement('div')]
        );

        et.setRoutingAroundBoundingRect(false);

        const boundaryLines = EntityDescriptorParser.extractBoundaryLines(et.getDescriptor());
        expect(boundaryLines.count()).toBe(0);
    });
});
