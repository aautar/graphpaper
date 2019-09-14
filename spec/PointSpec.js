import {Point} from '../src/Point'

describe("Point.getX", function() {
  it("returns x coordinate", function() {
    const p = new Point(-100, 200);
    expect(p.getX()).toBe(-100);
  });
});

describe("Point.getY", function() {  
  it("returns y coordinate", function() {
    const p = new Point(-100, 200);
    expect(p.getY()).toBe(200);
  });  
});
  
describe("Point.getCartesianPoint", function() {  
  it("returns a Point in cartesian coordinates", function() {
    const screenPoint = new Point(25, 75);
    const cartesianPoint = screenPoint.getCartesianPoint(100, 100);

    expect(cartesianPoint.getX()).toBe(-25);
    expect(cartesianPoint.getY()).toBe(-25);
  });  

});

describe("Point.isEqual", function() {  
  it("returns true is x and y coordinates match", function() {
    const p = new Point(-100, 200);
    expect(p.isEqual(new Point(-100, 200))).toBe(true);
  });  

  it("returns false is x and y coordinates don't match", function() {
    const p = new Point(-100, 200);
    expect(p.isEqual(new Point(0, 0))).toBe(false);
  });  
});

describe("Point.toArray", function() {
  it("returns Point(x,y) as [x,y]", function() {
    const p = new Point(-100, 200);
    expect(p.toArray()[0]).toBe(-100);
    expect(p.toArray()[1]).toBe(200);
  });
});

describe("Point.fromArray", function() {
  it("creates Point(x,y) from [x,y]", function() {
    const p = Point.fromArray([-100, 200]);
    expect(p.getX()).toBe(-100);
    expect(p.getY()).toBe(200);
  });
});
