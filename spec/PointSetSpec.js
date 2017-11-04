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
