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

describe("Line.createShortenedLine", function() {
  it("returns Line with same start and end points when line is shorted by 0px, 0px", function() {
    const line = new Line(new Point(100,100), new Point(200,200));
    const scaledLine = line.createShortenedLine(0, 0);

    expect(scaledLine.getLength()).toBe(line.getLength());
    expect(scaledLine.getStartPoint().getX()).toBe(100);
    expect(scaledLine.getStartPoint().getY()).toBe(100);
    expect(scaledLine.getEndPoint().getX()).toBe(200);
    expect(scaledLine.getEndPoint().getY()).toBe(200);
  });

  it("returns shortened Line when line is shortened by 10px, 10px", function() {
    const line = new Line(new Point(100,100), new Point(200,200));
    const scaledLine = line.createShortenedLine(10, 10);

    expect(scaledLine.getLength()).toBe(121.42135623730951);
    expect(scaledLine.getStartPoint().getX()).toBe(107.07106781186548);
    expect(scaledLine.getStartPoint().getY()).toBe(107.07106781186548);
    expect(scaledLine.getEndPoint().getX()).toBe(192.92893218813452);
    expect(scaledLine.getEndPoint().getY()).toBe(192.92893218813452);
  });

  it("returns shortened Line when line is shortened by 0px, 10px", function() {
    const line = new Line(new Point(0,0), new Point(0,100));
    const scaledLine = line.createShortenedLine(0, 10);

    expect(scaledLine.getLength()).toBe(90);
    expect(scaledLine.getStartPoint().getX()).toBe(0);
    expect(scaledLine.getStartPoint().getY()).toBe(0);
    expect(scaledLine.getEndPoint().getX()).toBe(0);
    expect(scaledLine.getEndPoint().getY()).toBe(90);
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

describe("Line.getMinX", function() {
  it("returns minimum x-coordinate", function() {
    const line = new Line(new Point(75, 100), new Point(100,200));
    expect(line.getMinX()).toBe(75);
  });
});

describe("Line.getMinY", function() {
  it("returns minimum y-coordinate", function() {
    const line = new Line(new Point(75, 100), new Point(100,200));
    expect(line.getMinY()).toBe(100);
  });
});

describe("Line.getMaxX", function() {
  it("returns maximum x-coordinate", function() {
    const line = new Line(new Point(75, 100), new Point(120,200));
    expect(line.getMaxX()).toBe(120);
  });
});

describe("Line.getMaxY", function() {
  it("returns maximum y-coordinate", function() {
    const line = new Line(new Point(75, 100), new Point(120,200));
    expect(line.getMaxY()).toBe(200);
  });
});
