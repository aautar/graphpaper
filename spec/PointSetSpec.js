import {Point} from '../src/Point'
import {PointSet} from '../src/PointSet'

describe("PointSet.push", function() {
 
  it("returns true if point is not in the set", function() {
    const ps = new PointSet();
    const pushOk = ps.push(new Point(-100, 200));
    expect(pushOk).toBe(true);
  });

  it("returns false if point is already in the set", function() {
    const ps = new PointSet();

    ps.push(new Point(-100, 200))
    const pushOk = ps.push(new Point(-100, 200));

    expect(pushOk).toBe(false);
  });

});

describe("PointSet constructor", function() {  
  it("takes array of Point objects", function() {
    const ps = new PointSet([
      new Point(-100, 200),
      new Point(-100, 200)
    ]);

    const pointSetArray = ps.toArray();

    expect(pointSetArray.length).toBe(1);
    expect(pointSetArray[0].getX()).toBe(-100);
    expect(pointSetArray[0].getY()).toBe(200);
  });  
});

describe("PointSet.findPointClosestTo", function() {  
  it("finds closest point", function() {
    const ps = new PointSet([
      new Point(10, 10),
      new Point(20, 20)
    ]);

    const closestPt = ps.findPointClosestTo(new Point(2,2));

    expect(closestPt.getX()).toBe(10);
    expect(closestPt.getY()).toBe(10);
  });  
});


describe("PointSet.toFloat64Array", function() {  
  it("returns array with x,y points", function() {
    const ps = new PointSet([
      new Point(1, 2),
      new Point(3, 4)
    ]);

    const typedArray = ps.toFloat64Array();

    expect(typedArray.length).toBe(4);
    expect(typedArray[0]).toBe(1);
    expect(typedArray[1]).toBe(2);
    expect(typedArray[2]).toBe(3);
    expect(typedArray[3]).toBe(4);
    
  });  
});

describe("PointSet.fromFloat64Array", function() {  
  it("creates PointSet from Float64Array coordinates", function() {

    const typedArray = Float64Array.from([1,2,3,4]);

    const ps = new PointSet();    
    ps.fromFloat64Array(typedArray);
    const pointSetArray = ps.toArray();

    expect(ps.count()).toBe(2);
    expect(pointSetArray[0].isEqual(new Point(1,2))).toBe(true);
    expect(pointSetArray[1].isEqual(new Point(3,4))).toBe(true);
    
  });  
});
