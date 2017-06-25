import {Point} from '../src/Point'

describe("Point", function() {
 
  it("getX returns x coordinate", function() {
    var p = new Point(-100, 200);
    expect(p.getX()).toBe(-100);
  });

  it("getY returns y coordinate", function() {
    var p = new Point(-100, 200);
    expect(p.getY()).toBe(200);
  });  
  
});
