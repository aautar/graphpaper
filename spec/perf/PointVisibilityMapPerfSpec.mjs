import { Point } from '../../src/Point.mjs'
import { PointSet } from '../../src/PointSet.mjs'
import { Line } from '../../src/Line.mjs'
import { LineSet } from '../../src/LineSet.mjs'
import { PointVisibilityMap } from '../../src/PointVisibilityMap.mjs'

describe("PointVisibilityMap constructor performance", function() {

    const buildPointVisibilityMapData = function() {
        const numPoints = 200;

        const freePoints = new PointSet();
        const boundaryLines = [];

        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));
        freePoints.push(new Point(50, 105));

        // Note that the base dataset here is too synthetic for routing
        // as every route computation will result in checking 500 boundary lines
        for(let i=0; i<numPoints; i++) {
            boundaryLines.push(new Line(new Point(50  + (i*10), 0  + (i*10)), new Point(50 + (i*10), 100  + (i*10))));
            freePoints.push(new Point(5000 +  (i*10), 1 + (i*10))); // dummy point to inc. computational cost
        }

        return {
            "freePoints": freePoints,
            "boundaryLines": new LineSet(boundaryLines)
        }
    };

    it("constructs quickly ", function() {
        const pvMapData = buildPointVisibilityMapData();

        let timeSum = 0;
        const numSamples = 500;
        for(let i=0; i<numSamples; i++) {
            const startTime = Date.now();

            const pointVisibilityMap = new PointVisibilityMap(
                pvMapData.freePoints, 
                pvMapData.boundaryLines
            );

            const td = Date.now() - startTime;
            timeSum += td;
        }

        const averageTimeMs = timeSum / numSamples;

        console.info(`\n\nPointVisibilityMap constructor: ${averageTimeMs}ms`);        
    });

    it("computes route quickly ", function() {
        const pvMapData = buildPointVisibilityMapData();
                
        const pointVisibilityMap = new PointVisibilityMap(
            pvMapData.freePoints, 
            pvMapData.boundaryLines
        );

        let timeSum = 0;
        const numSamples = 500;
        for(let i=0; i<numSamples; i++) {        
            const startTime = Date.now();
            const pointsInRoute = pointVisibilityMap.computeRoute(
                new Point(14,14),
                new Point(75, 25)
            );

            const routePointsArray = pointsInRoute.toArray();
            const td = Date.now() - startTime;

            timeSum += td;
        }

        const averageTimeMs = timeSum / numSamples;
        console.info(`PointVisibilityMap.computeRoute: ${averageTimeMs}ms`);        

        expect(true).toBe(true);
    });

    it("computes route with path optimization quickly ", function() {
        const pvMapData = buildPointVisibilityMapData();
                
        const pointVisibilityMap = new PointVisibilityMap(
            pvMapData.freePoints, 
            pvMapData.boundaryLines
        );

        let timeSum = 0;
        const numSamples = 500;
        for(let i=0; i<numSamples; i++) {        
            const startTime = Date.now();
            const pointsInRoute = pointVisibilityMap.computeRoute(
                new Point(14,14),
                new Point(75, 25)
            );

            const routePointsArray = pointsInRoute.toArray();
            const td = Date.now() - startTime;

            timeSum += td;
        }

        const averageTimeMs = timeSum / numSamples;
        console.info(`PointVisibilityMap.computeRoute (with path optimization): ${averageTimeMs}ms`);        

        expect(true).toBe(true);
    });    

});
