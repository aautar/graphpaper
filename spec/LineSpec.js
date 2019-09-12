import {Point} from '../src/Point'
import {Line} from '../src/Line'
import {LINE_INTERSECTION_TYPE, LineIntersection} from '../src/LineIntersection'

describe("Line.getLength", function() {
  it("returns distance of the line segment", function() {
    const line = new Line(new Point(0,0), new Point(0,100));
    expect(line.getLength()).toBe(100.0);
  });
});

describe("Line.getDirection", function() {
  it("returns normalized direction vector for given line", function() {
    const lineA = new Line(new Point(0,0), new Point(100,200));
    expect(lineA.getDirection().toString()).toBe(`0.4472135954999579 0.8944271909999159`);
  });
});

describe("Line.isEqual", function() {
  it("returns true if start and end points of line are the same", function() {
    const lineA = new Line(new Point(100,200), new Point(300,400));
    const lineB = new Line(new Point(100,200), new Point(300,400));

    expect(lineA.isEqual(lineB)).toBe(true);
  });
});

describe("Line.createScaledLine", function() {
  it("returns Line with same start and end points for scaleFactor = 1.0, 1.0", function() {
    const line = new Line(new Point(100,100), new Point(200,200));
    const scaledLine = line.getCopyScaledRelativeToStart(1.0);

    expect(scaledLine.getLength()).toBe(line.getLength());
    expect(scaledLine.getStartPoint().getX()).toBe(100);
    expect(scaledLine.getStartPoint().getY()).toBe(100);
    expect(scaledLine.getEndPoint().getX()).toBe(200);
    expect(scaledLine.getEndPoint().getY()).toBe(200);
  });

  it("returns Line with same start point, just shorted end point for scaleFactor = 1.0, 0.5", function() {
    const line = new Line(new Point(100,100), new Point(200,200));
    const scaledLine = line.getCopyScaledRelativeToStart(0.5);

    expect(scaledLine.getLength()).toBe(line.getLength() * 0.5);
    expect(scaledLine.getStartPoint().getX()).toBe(100);
    expect(scaledLine.getStartPoint().getY()).toBe(100);
    expect(scaledLine.getEndPoint().getX()).toBe(150);
    expect(scaledLine.getEndPoint().getY()).toBe(150);
  });


});

describe("Line.computeIntersection", function() {
 
  it("returns LINE_INTERSECTION_TYPE.LINESEG intersection type for intersection on line", function() {
    const line1 = new Line(new Point(0,0), new Point(100,100));
    const line2 = new Line(new Point(0,100), new Point(100,0));

    const intersection = line2.computeIntersection(line1);

    expect(intersection.getType()).toBe(LINE_INTERSECTION_TYPE.LINESEG);
  });

  it("returns intersection point for intersection on line", function() {
    const line1 = new Line(new Point(0,0), new Point(100,100));
    const line2 = new Line(new Point(0,100), new Point(100,0));

    const intersection = line2.computeIntersection(line1);

    expect(intersection.getIntersectionPoint().getX()).toBe(50.0);
    expect(intersection.getIntersectionPoint().getY()).toBe(50.0);
  });  

  it("returns LINE_INTERSECTION_TYPE.LINE intersection type for intersection outside of line segment", function() {
    const line = new Line(new Point(0,0), new Point(100,100));

    const intersection = line.computeIntersection(
        new Line(new Point(-500,-500), new Point(-500,100))
    );

    expect(intersection.getType()).toBe(LINE_INTERSECTION_TYPE.LINE);
  });
  
});
