import { Dimensions } from '../src/Dimensions.mjs'

describe("Dimensions", function () {
    it("getWidth returns width", function () {
        var p = new Dimensions(100, 200);
        expect(p.getWidth()).toBe(100);
    });

    it("getY returns y coordinate", function () {
        var p = new Dimensions(100, 200);
        expect(p.getHeight()).toBe(200);
    });
});
