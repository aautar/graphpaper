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

describe("Point constructor", function() {  
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
