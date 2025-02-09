import {SvgPathBuilder} from '../src/SvgPathBuilder.mjs'
import { Point } from '../src/Point.mjs';

describe("SvgPathBuilder.pointsToPath", function() {
    it("returns SVG path string with given Points", function() {
        const points = [];
        points.push(new Point(0, 0));
        points.push(new Point(10, 10));
        points.push(new Point(20, 20));
        points.push(new Point(20, 100));
        points.push(new Point(200, 500));

        const svgPathStr = SvgPathBuilder.pointsToPath(points);

        expect(svgPathStr).toBe("M0 0 L10 10 L20 20 L20 100 L200 500");
    });
});

describe("SvgPathBuilder.pointToLineTo", function() {
    it("returns correct fragment for first point", function() {
        const lineToStr = SvgPathBuilder.pointToLineTo(new Point(20, 100), 0);
        expect(lineToStr).toBe("M20 100");
    });

    it("returns correct fragment for non-first point", function() {
        const lineToStr = SvgPathBuilder.pointToLineTo(new Point(20, 100), 1);
        expect(lineToStr).toBe("L20 100");
    });
});
