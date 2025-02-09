import { Point } from '../src/Point.mjs';
import { PointVisibilityMapRouteOptimizer } from '../src/PointVisibilityMapRouteOptimizer.mjs'

describe("PointVisibilityMapRouteOptimizer.optimize", function () {

    it("does no optimization if no points are visible to each other", function () {
        const route = [
            new Point(0, 0),
            new Point(100, 200),
            new Point(200, 300),
        ];

        const arePointsVisibleToEachOther = function (_ptA, _ptB) {
            return false;
        };

        PointVisibilityMapRouteOptimizer.optimize(route, arePointsVisibleToEachOther);

        expect(route.length).toBe(3);

        expect(route[0].getX()).toBe(0);
        expect(route[0].getY()).toBe(0);

        expect(route[1].getX()).toBe(100);
        expect(route[1].getY()).toBe(200);

        expect(route[2].getX()).toBe(200);
        expect(route[2].getY()).toBe(300);
    });

    it("does no optimization for 0 points", function () {
        const route = [

        ];

        const arePointsVisibleToEachOther = function (_ptA, _ptB) {
            return true;
        };

        PointVisibilityMapRouteOptimizer.optimize(route, arePointsVisibleToEachOther);

        expect(route.length).toBe(0);
    });

    it("does no optimization for 1 point", function () {
        const route = [
            new Point(100, 200),
        ];

        const arePointsVisibleToEachOther = function (_ptA, _ptB) {
            return true;
        };

        PointVisibilityMapRouteOptimizer.optimize(route, arePointsVisibleToEachOther);

        expect(route.length).toBe(1);

        expect(route[0].getX()).toBe(100);
        expect(route[0].getY()).toBe(200);
    });

    it("does no optimization for 2 points", function () {
        const route = [
            new Point(0, 0),
            new Point(100, 200),
        ];

        const arePointsVisibleToEachOther = function (_ptA, _ptB) {
            return true;
        };

        PointVisibilityMapRouteOptimizer.optimize(route, arePointsVisibleToEachOther);

        expect(route.length).toBe(2);

        expect(route[0].getX()).toBe(0);
        expect(route[0].getY()).toBe(0);

        expect(route[1].getX()).toBe(100);
        expect(route[1].getY()).toBe(200);
    });

    it("does optimization of 3 points where 1st and 3rd are visible to each other", function () {
        const route = [
            new Point(0, 0),
            new Point(100, 200),
            new Point(200, 300),
        ];

        const arePointsVisibleToEachOther = function (_ptA, _ptB) {
            if (_ptA.isEqual(new Point(0, 0)) && _ptB.isEqual(new Point(200, 300))) {
                return true;
            }

            return false;
        };

        PointVisibilityMapRouteOptimizer.optimize(route, arePointsVisibleToEachOther);

        expect(route.length).toBe(2);

        expect(route[0].getX()).toBe(0);
        expect(route[0].getY()).toBe(0);

        expect(route[1].getX()).toBe(200);
        expect(route[1].getY()).toBe(300);
    });

});
