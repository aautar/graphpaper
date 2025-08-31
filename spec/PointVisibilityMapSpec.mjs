import { Point } from '../src/Point.mjs'
import { PointVisibilityMap } from '../src/PointVisibilityMap.mjs'

describe("PointVisibilityMap.findVisiblePointInfoClosestTo", function() {
    it("returns null when there are no points in PointVisibilityMap", function() {
        const pointVisibilityMap = new PointVisibilityMap();
        expect(pointVisibilityMap.findVisiblePointInfoClosestTo(new Point(-100, 200))).toBe(null);
    });

    it("returns PointInfo object with closest visible point", function() {
        const entityDescriptor = {
            x: 25,
            y: 25,
            width: 100,
            height: 100,
            connectorAnchors: [],
            isRoutingAroundBoundingRectAllowed: true,
            outerBoundingRect: {
                minX: 25,
                minY: 25,
                maxX: 100,
                maxY: 100
            }            
        };

        const pointVisibilityMap = new PointVisibilityMap();
        pointVisibilityMap.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors([entityDescriptor], 12.0);

        const closestVisiblePoint = (pointVisibilityMap.findVisiblePointInfoClosestTo(new Point(10, 10))).point;
        // we expect the computed extent point
        expect(closestVisiblePoint.getX()).toBe(13.0);
        expect(closestVisiblePoint.getY()).toBe(13.0);
    });
});

describe("PointVisibilityMap.computeRoute", function() {
    it("returns PointSet with route around boundary", function() {
        const entityDescriptor = {
            x: 25,
            y: 25,
            width: 100,
            height: 100,
            connectorAnchors: [],
            isRoutingAroundBoundingRectAllowed: true,
            outerBoundingRect: {
                minX: 25,
                minY: 25,
                maxX: 100,
                maxY: 100
            }
        };

        const pointVisibilityMap = new PointVisibilityMap();
        pointVisibilityMap.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors([entityDescriptor], 12.0);

        const pointsInRoute = pointVisibilityMap.computeRoute(
            new Point(5, 5),
            new Point(150, 150)
        );

        const routePointsArray = pointsInRoute.toArray();

        expect(routePointsArray.length).toBe(4);

        expect(routePointsArray[0].getX()).toBe(13);
        expect(routePointsArray[0].getY()).toBe(13);

        expect(routePointsArray[1].getX()).toBe(137);
        expect(routePointsArray[1].getY()).toBe(13);

        expect(routePointsArray[2].getX()).toBe(137);
        expect(routePointsArray[2].getY()).toBe(137);
        
        expect(routePointsArray[3].getX()).toBe(13);
        expect(routePointsArray[3].getY()).toBe(137);        
    });
});
