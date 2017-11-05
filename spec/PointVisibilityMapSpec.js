import {Point} from '../src/Point'
import {Line} from '../src/Line'
import {PointVisibilityMap} from '../src/PointVisibilityMap'

describe("PointVisibilityMap.findVisiblePointClosestTo", function() {

    it("returns null when there are no points in PointVisibilityMap", function() {
        const pointVisibilityMap = new PointVisibilityMap([], []);
        expect(pointVisibilityMap.findVisiblePointClosestTo(new Point(-100, 200))).toBe(null);
    });

    it("returns null when there are no visible points", function() {
        const pointVisibilityMap = new PointVisibilityMap(
            [
                new Point(25, 25)
            ], 
            [
                new Line(new Point(50,0), new Point(50,100))
            ]
        );

        expect(pointVisibilityMap.findVisiblePointClosestTo(new Point(60, 60))).toBe(null);
    });

    it("returns closest visible point for single visible point", function() {
        const pointVisibilityMap = new PointVisibilityMap(
            [
                new Point(25, 25)
            ], 
            [
                new Line(new Point(50,0), new Point(50,100))
            ]
        );

        const closestVisiblePoint = pointVisibilityMap.findVisiblePointClosestTo(new Point(10, 10));
        expect(closestVisiblePoint.getX()).toBe(25);
        expect(closestVisiblePoint.getY()).toBe(25);
    });  

    it("returns closest visible point for multiple visible points", function() {
        const pointVisibilityMap = new PointVisibilityMap(
            [
                new Point(15, 15),
                new Point(25, 25)
            ], 
            [
                new Line(new Point(50,0), new Point(50,100))
            ]
        );

        const closestVisiblePoint = pointVisibilityMap.findVisiblePointClosestTo(new Point(10, 10));
        expect(closestVisiblePoint.getX()).toBe(15);
        expect(closestVisiblePoint.getY()).toBe(15);
    });

});
