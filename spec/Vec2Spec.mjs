import { Vec2 } from '../src/Vec2.mjs'

describe("Vec2.normalize", function() {
    it("normalizes non-zero vector", function() {
        const v = new Vec2(100, 200);
        v.normalize();

        expect(v.getX()).toBe(0.4472135954999579);
        expect(v.getY()).toBe(0.8944271909999159);
    });

    it("normalizes zero vector to zero vector", function() {
        const v = new Vec2(0, 0);
        v.normalize();

        expect(v.getX()).toBe(0);
        expect(v.getY()).toBe(0);
    });
});

describe("Vec2.dot", function() {
    it("returns dot product", function() {
        const v1 = new Vec2(0.5, 0.5);
        v1.normalize();

        const v2 = new Vec2(-1.0, 0);
        v2.normalize();

        expect(v1.dot(v2)).toBe(-0.7071067811865475);

    });
});
