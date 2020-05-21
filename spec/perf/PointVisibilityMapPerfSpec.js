import {Point} from '../../src/Point'
import {PointSet} from '../../src/PointSet'
import {Line} from '../../src/Line'
import {LineSet} from '../../src/LineSet'
import {PointVisibilityMap} from '../../src/PointVisibilityMap'

describe("PointVisibilityMap constructor performance", function() {

    it("constructs quickly ", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));
        freePoints.push(new Point(50, 105));

        const boundaryLines = [];
        for(let i=0; i<500; i++) {
            boundaryLines.push(new Line(new Point(50,0), new Point(50,100)));
            freePoints.push(new Point(5000 + i, -1)); // dummy point to inc. computational cost
        }

        let timeSum = 0;
        let numIterations = 1000;
        for(let i=0; i<numIterations; i++) {
            const startTime = Date.now();

            const pointVisibilityMap = new PointVisibilityMap(
                freePoints, 
                new LineSet(boundaryLines)
            );

            const td = Date.now() - startTime;
            timeSum += td;
        }

        const averageTimeMs = timeSum / numIterations;

        console.info(`\n\nPointVisibilityMap constructor: ${averageTimeMs}ms`);        
    });

    it("computes route quickly ", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));
        freePoints.push(new Point(50, 105));

        const boundaryLines = [];
        for(let i=0; i<500; i++) {
            boundaryLines.push(new Line(new Point(50,0), new Point(50,100)));
            freePoints.push(new Point(5000 + i, -1)); // dummy point to inc. computational cost
        }
                
        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(boundaryLines)
        );

        let timeSum = 0;
        let numIterations = 1000;
        for(let i=0; i<numIterations; i++) {        
            const startTime = Date.now();
            const pointsInRoute = pointVisibilityMap.computeRoute(
                new Point(14,14),
                new Point(75, 25)
            );

            const routePointsArray = pointsInRoute.toArray();
            const td = Date.now() - startTime;

            timeSum += td;
        }

        const averageTimeMs = timeSum / numIterations;
        console.info(`PointVisibilityMap.computeRoute: ${averageTimeMs}ms`);        

        expect(true).toBe(true);
    });

    it("computes route with path optimization quickly ", function() {
        const freePoints = new PointSet();
        freePoints.push(new Point(15, 15));
        freePoints.push(new Point(51, 1));
        freePoints.push(new Point(50, 105));

        const boundaryLines = [];
        for(let i=0; i<500; i++) {
            boundaryLines.push(new Line(new Point(50,0), new Point(50,100)));
            freePoints.push(new Point(5000 + i, -1)); // dummy point to inc. computational cost
        }
                
        const pointVisibilityMap = new PointVisibilityMap(
            freePoints, 
            new LineSet(boundaryLines)
        );

        let timeSum = 0;
        let numIterations = 1000;
        for(let i=0; i<numIterations; i++) {        
            const startTime = Date.now();
            const pointsInRoute = pointVisibilityMap.computeRoute(
                new Point(14,14),
                new Point(75, 25)
            );

            const routePointsArray = pointsInRoute.toArray();
            const td = Date.now() - startTime;

            timeSum += td;
        }

        const averageTimeMs = timeSum / numIterations;
        console.info(`PointVisibilityMap.computeRoute (with path optimization): ${averageTimeMs}ms`);        

        expect(true).toBe(true);
    });    

});
