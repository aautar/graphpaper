import {SvgPathBuilder} from '../src/SvgPathBuilder'
import { Point } from '../src/Point';

describe("SvgPathBuilder.pointsToPath", function() {

    it("returns SVG path string with given Points", function() {

        const points = [];
        points.push(new Point(0, 0));
        points.push(new Point(10, 10));
        points.push(new Point(20, 20));
        points.push(new Point(20, 100));
        points.push(new Point(200, 500));

        const svgPathStr = SvgPathBuilder.pointsToPath(points);

        expect(svgPathStr).toBe("M0 0L10 10 L20 20 L20 100 L200 500");
    });

});
