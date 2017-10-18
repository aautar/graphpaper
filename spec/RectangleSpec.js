import {Rectangle} from '../src/Rectangle'

describe("Rectangle", function() {
 
  it("checkIntersect returns true is otherRectangle is fully containing with the rectangle", function() {
    var r = new Rectangle(0, 0, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(45,45,75,75));
    expect(isIntersecting).toBe(true);
  });

  it("checkIntersect returns true is otherRectangle is the same as the rectangle", function() {
    var r = new Rectangle(0, 0, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(0,0,100,100));
    expect(isIntersecting).toBe(true);
  });

  it("checkIntersect returns false is otherRectangle is fully above the rectangle", function() {
    var r = new Rectangle(0, 0, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(45,-200,75,-100));
    expect(isIntersecting).toBe(false);
  });

  it("checkIntersect returns false is otherRectangle is fully below the rectangle", function() {
    var r = new Rectangle(0, 0, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(45,200,75,300));
    expect(isIntersecting).toBe(false);
  });  

  it("checkIntersect returns false is otherRectangle is fully to the left of the rectangle", function() {
    var r = new Rectangle(50, 50, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(0,0,25,100));
    expect(isIntersecting).toBe(false);
  });  

  it("checkIntersect returns false is otherRectangle is fully to the right of the rectangle", function() {
    var r = new Rectangle(50, 50, 100, 100);
    var isIntersecting = r.checkIntersect(new Rectangle(150,0,200,100));
    expect(isIntersecting).toBe(false);
  });   

});

describe("Rectangle.getProjectedPoints", function() {
  it("returns 4 projected points", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getProjectedPoints(2.0);

    expect(rPoints.length).toBe(4);
  });

  it("returns projected points in clockwise order, from top-left", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getProjectedPoints(2.0);

    expect(rPoints[0].getX()).toBe(23.0);
    expect(rPoints[0].getY()).toBe(23.0);

    expect(rPoints[1].getX()).toBe(52.0);
    expect(rPoints[1].getY()).toBe(23.0);    

    expect(rPoints[2].getX()).toBe(52.0);
    expect(rPoints[2].getY()).toBe(52.0);        

    expect(rPoints[3].getX()).toBe(23.0);
    expect(rPoints[3].getY()).toBe(52.0);            
  });  
});
