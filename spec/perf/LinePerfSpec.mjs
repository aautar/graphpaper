import { Point } from '../../src/Point.mjs'
import { Line } from '../../src/Line.mjs'

describe("Line.computeIntersection performance", function() {
 
    it("computes intersection type quickly", function() {

        let startTime = Date.now();

        for(let i=0; i<250000; i++) {
            const line1 = new Line(new Point(0+i,0), new Point(100,100));
            const line2 = new Line(new Point(0,100), new Point(100+i,0));

            const intersection = line2.computeIntersection(line1);
        }

        const td = Date.now() - startTime;
        console.info(`\n\nLine.computeIntersection performance (250K intersection checks): ${td}ms`);       
        
        expect(true).toBe(true);
    });

});
