import {Point} from '../src/Point'

describe("Point", function() {
 
  it("getX returns x coordinate", function() {
    var p = new Point(-100, 200);
    expect(p.getX()).toBe(-100);
  });
  
});
