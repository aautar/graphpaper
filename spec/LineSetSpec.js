import {Point} from '../src/Point'
import {Line} from '../src/Line'
import {LineSet} from '../src/LineSet'

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
  
  describe("LineSet.fromFloat64Array", function() {  
    it("creates LineSet from Float64Array coordinates", function() {
  
      const typedArray = Float64Array.from([1,2,3,4,5,6,7,8]);
  
      const ls = new LineSet();    
      ls.fromFloat64Array(typedArray);
      const lineSetArray = ls.toArray();
  
      expect(ls.count()).toBe(2);
      expect(lineSetArray[0].isEqual(new Line(new Point(1, 2), new Point(3, 4)))).toBe(true);
      expect(lineSetArray[1].isEqual(new Line(new Point(5, 6), new Point(7, 8)))).toBe(true);
      
    });  
  });
  