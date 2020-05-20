import {Point} from '../src/Point'
import {PointSet} from '../src/PointSet'
import {Line} from '../src/Line'
import {LineSet} from '../src/LineSet'
import {PointVisibilityMap} from '../src/PointVisibilityMap'

describe("PointVisibilityMap constructor", function() {
    it("can construct correct PointVisibilityMap with precomputed data", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));

        const boundaryLines = new LineSet(
            [
                new Line(new Point(50,0), new Point(50,100))
            ]
        );

        const pointVisibilityMapPre = new PointVisibilityMap(freePoints, boundaryLines);
        const pvMapData = pointVisibilityMapPre.getPointToVisibleSetData();

        const pointVisibilityMap = new PointVisibilityMap(freePoints, boundaryLines, pvMapData)
        const closestVisiblePoint = pointVisibilityMap.findVisiblePointClosestTo(new Point(14, 14));
        expect(closestVisiblePoint.getX()).toBe(15);
        expect(closestVisiblePoint.getY()).toBe(15);
    });
});

describe("PointVisibilityMap.findVisiblePointClosestTo", function() {

    it("returns null when there are no points in PointVisibilityMap", function() {
        const pointVisibilityMap = new PointVisibilityMap(new PointSet(), new LineSet());
        expect(pointVisibilityMap.findVisiblePointClosestTo(new Point(-100, 200))).toBe(null);
    });

    it("returns null when there are no visible points", function() {

        const freePoints = new PointSet();
        freePoints.push(new Point(25, 25));

        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(
                [
                    new Line(new Point(50,0), new Point(50,100))
                ]
            )
        );

        expect(pointVisibilityMap.findVisiblePointClosestTo(new Point(60, 60))).toBe(null);
    });

    it("returns closest visible point for single visible point", function() {

        const freePoints = new PointSet();
        freePoints.push(new Point(25, 25));

        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(
                [
                    new Line(new Point(50,0), new Point(50,100))
                ]
            )
        );

        const closestVisiblePoint = pointVisibilityMap.findVisiblePointClosestTo(new Point(10, 10));
        expect(closestVisiblePoint.getX()).toBe(25);
        expect(closestVisiblePoint.getY()).toBe(25);
    });  

    it("returns closest visible point for multiple visible points", function() {

        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));

        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(
                [
                    new Line(new Point(50,0), new Point(50,100))
                ]
            )
        );

        const closestVisiblePoint = pointVisibilityMap.findVisiblePointClosestTo(new Point(14, 14));
        expect(closestVisiblePoint.getX()).toBe(15);
        expect(closestVisiblePoint.getY()).toBe(15);
    });
});

describe("PointVisibilityMap.computeRoute", function() {
    it("returns PointSet with 2 points for map with 2 points are no boundaries", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(25, 25));

        const pointVisibilityMap = new PointVisibilityMap(freePoints, new LineSet());        

        const pointsInRoute = pointVisibilityMap.computeRoute(
            new Point(14,14),
            new Point(26,26)
        );

        const routePointsArray = pointsInRoute.toArray();

        expect(routePointsArray.length).toBe(2);

        expect(routePointsArray[0].getX()).toBe(15);
        expect(routePointsArray[0].getY()).toBe(15);

        expect(routePointsArray[1].getX()).toBe(25);
        expect(routePointsArray[1].getY()).toBe(25);
    });


    it("returns empty PointSet, when routing is only possible to 1 point (unable to route to endpoint)", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));

        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(
                [
                    new Line(new Point(50,0), new Point(50,100))
                ]
            )
        );

        const pointsInRoute = pointVisibilityMap.computeRoute(
            new Point(14,14),
            new Point(51,1)
        );

        const routePointsArray = pointsInRoute.toArray();

        expect(routePointsArray.length).toBe(0);
    });

    it("returns PointSet with 3 point, routing around a boundary", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));
        freePoints.push(new Point(50, 105));

        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(
                [
                    new Line(new Point(50,0), new Point(50,100))
                ]
            )
        );

        const pointsInRoute = pointVisibilityMap.computeRoute(
            new Point(14,14),
            new Point(75, 25)
        );

        const routePointsArray = pointsInRoute.toArray();

        expect(routePointsArray.length).toBe(3);
        expect(routePointsArray[0].getX()).toBe(15);
        expect(routePointsArray[0].getY()).toBe(15);

        expect(routePointsArray[1].getX()).toBe(50);
        expect(routePointsArray[1].getY()).toBe(105);        

        expect(routePointsArray[2].getX()).toBe(51);
        expect(routePointsArray[2].getY()).toBe(1);                
    });    

});
