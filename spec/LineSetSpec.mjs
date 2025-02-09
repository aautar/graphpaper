import {Point} from '../src/Point.mjs'
import {Line} from '../src/Line.mjs'
import {LineSet} from '../src/LineSet.mjs'

describe("LineSet.toFloat64Array", function() {  
    it("returns array with x,y points", function() {
        const ls = new LineSet([
            new Line(new Point(1, 2), new Point(3, 4)),
            new Line(new Point(5, 6), new Point(7, 8))
        ]);

        const typedArray = ls.toFloat64Array();

        expect(typedArray.length).toBe(8);
        expect(typedArray[0]).toBe(1);
        expect(typedArray[1]).toBe(2);
        expect(typedArray[2]).toBe(3);
        expect(typedArray[3]).toBe(4);
        expect(typedArray[4]).toBe(5);
        expect(typedArray[5]).toBe(6);
        expect(typedArray[6]).toBe(7);
        expect(typedArray[7]).toBe(8);
    });
});
  
describe("LineSet constructor", function() {  
    it("creates LineSet from Float64Array coordinates", function() {
        const typedArray = Float64Array.from([1,2,3,4,5,6,7,8]);
        const ls = new LineSet(typedArray);

        const lineSetArray = ls.toArray();
        expect(ls.count()).toBe(2);
        expect(lineSetArray[0].isEqual(new Line(new Point(1, 2), new Point(3, 4)))).toBe(true);
        expect(lineSetArray[1].isEqual(new Line(new Point(5, 6), new Point(7, 8)))).toBe(true);
    });  
});

describe("LineSet.push", function() {  
    it("pushes new line into set", function() {
        const expectedLinesInSet = [
            new Line(new Point(1, 2), new Point(3, 4))
        ];

        const ls = new LineSet([]);
        ls.push(new Line(new Point(1, 2), new Point(3, 4)));

        expect(ls.count()).toBe(1);
        expect(ls.toArray()[0].isEqual(expectedLinesInSet[0])).toBe(true);
    });

    it("does not push line if it already exists in set", function() {
        const expectedLinesInSet = [
            new Line(new Point(1, 2), new Point(3, 4))
        ];

        const ls = new LineSet([]);
        ls.push(new Line(new Point(1, 2), new Point(3, 4)));
        ls.push(new Line(new Point(1, 2), new Point(3, 4)));

        expect(ls.count()).toBe(1);
        expect(ls.toArray()[0].isEqual(expectedLinesInSet[0])).toBe(true);
    });    
});
