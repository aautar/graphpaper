import {Rectangle} from '../src/Rectangle'
import {Point} from '../src/Point'

describe("Rectangle.checkIntersect", function() {
 
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


describe("Rectangle.getPoints", function() {
  it("returns 4 projected points", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getPoints();

    expect(rPoints.length).toBe(4);
  });

  it("returns points in clockwise order, from top-left", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getPoints();

    expect(rPoints[0].getX()).toBe(25.0);
    expect(rPoints[0].getY()).toBe(25.0);

    expect(rPoints[1].getX()).toBe(50.0);
    expect(rPoints[1].getY()).toBe(25.0);    

    expect(rPoints[2].getX()).toBe(50.0);
    expect(rPoints[2].getY()).toBe(50.0);        

    expect(rPoints[3].getX()).toBe(25.0);
    expect(rPoints[3].getY()).toBe(50.0);            
  });  
});


describe("Rectangle.getPointsScaledToGrid", function() {
  it("returns 4 projected points", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getPointsScaledToGrid(2.0);

    expect(rPoints.length).toBe(4);
  });

  it("returns projected points in clockwise order, from top-left", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const rPoints = r.getPointsScaledToGrid(2.0);

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

describe("Rectangle.getLines", function() {
  it("returns Line objects", function() {
    const r = new Rectangle(25, 25, 50, 50);
    const lines = r.getLines();

    expect(lines[0].getStartPoint().getX()).toBe(25);
    expect(lines[0].getStartPoint().getY()).toBe(25);
    expect(lines[0].getEndPoint().getX()).toBe(50);
    expect(lines[0].getEndPoint().getY()).toBe(25);    

    expect(lines[1].getStartPoint().getX()).toBe(50);
    expect(lines[1].getStartPoint().getY()).toBe(25);
    expect(lines[1].getEndPoint().getX()).toBe(50);
    expect(lines[1].getEndPoint().getY()).toBe(50);        

    expect(lines[2].getStartPoint().getX()).toBe(50);
    expect(lines[2].getStartPoint().getY()).toBe(50);
    expect(lines[2].getEndPoint().getX()).toBe(25);
    expect(lines[2].getEndPoint().getY()).toBe(50);        

    expect(lines[3].getStartPoint().getX()).toBe(25);
    expect(lines[3].getStartPoint().getY()).toBe(50);
    expect(lines[3].getEndPoint().getX()).toBe(25);
    expect(lines[3].getEndPoint().getY()).toBe(25);

    expect(lines.length).toBe(4);
  });
});

describe("Rectangle.checkIsPointWithin", function() {

  it("returns true if point is within rectangle", function() {
    const r = new Rectangle(0, 0, 200, 200);
    const isWithin = r.checkIsPointWithin(new Point(100, 100));
    expect(isWithin).toBe(true);
  });

  it("returns false if point is outside rectangle", function() {
    const r = new Rectangle(0, 0, 100, 100);
    const isWithin = r.checkIsPointWithin(new Point(50, 150));
    expect(isWithin).toBe(false);
  });  

});

describe("Rectangle.getWidth", function() {
  it("returns correct width", function() {
    const r = new Rectangle(1, 2, 200, 200);
    expect(r.getWidth()).toBe(199);
  });
});

describe("Rectangle.getHeight", function() {
  it("returns correct height", function() {
    const r = new Rectangle(1, 2, 200, 200);
    expect(r.getHeight()).toBe(198);
  });
});

describe("Rectangle.getUniformlyResizedCopy", function() {
  it("returns correctly sized Rectangle", function() {
    const r = new Rectangle(100, 100, 200, 200);
    const rScaled = r.getUniformlyResizedCopy(2);

    expect(rScaled.getTop()).toBe(98);
    expect(rScaled.getLeft()).toBe(98);
    expect(rScaled.getRight()).toBe(202);
    expect(rScaled.getBottom()).toBe(202);
  });
});
