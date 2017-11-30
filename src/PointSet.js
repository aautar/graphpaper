import  {Point} from './Point';
import  {Line} from './Line';

/**
 * Unique collection of Point objects
 * 
 * @param {Point[]|undefined} _points
 */
function PointSet(_points) {

    const self = this;

    /**
     * @type {Point[]}
     */
    const points = [];

    /**
     * @param {Point} _newPoint
     */
    this.push = function(_newPoint) {
        var alreadyInPointsArray = false;
        points.forEach(function(_existingPoint) {
            if(_newPoint.isEqual(_existingPoint)) {
                alreadyInPointsArray = true;
            }
        });        

        if(alreadyInPointsArray) {
            return false;
        }

        points.push(_newPoint);
        return true;
    };

    /**
     * 
     * @param {Point} _point 
     * @returns {Point}
     */
    this.findPointClosestTo = function(_point) {
        var resultPoint = null;
        var currentMinLength = Number.MAX_SAFE_INTEGER;

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() < currentMinLength) {
                resultPoint = _pt;
                currentMinLength = lineToPt.getLength();
            }
        });
        
        return resultPoint;        
    };

    this.findDistanceToPointClosestTo = function(_point) {
        var currentMinLength = Number.MAX_SAFE_INTEGER;

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() < currentMinLength) {
                currentMinLength = lineToPt.getLength();
            }
        });
        
        return currentMinLength;        
    };    

    /**
     * 
     * @param {Point} _point 
     * @returns {PointSet}
     */
    this.findPointsCloseTo = function(_point, _radius) {
        const resultSet = new PointSet();

        points.forEach(function(_pt) {
            const lineToPt = new Line(_point, _pt);
            if(lineToPt.getLength() <= _radius) {
                resultSet.push(_pt);
            }
        });
        
        return resultSet;        
    };    

    /**
     * @returns {Point[]}
     */
    this.toArray = function() {
        return points;
    };

    /**
     * @returns {Float64Array}
     */
    this.toFloat64Array = function() {

        const result = new Float64Array(points.length * 2);
        for(let i=0; i<points.length; i++) {
            result[0 + (i*2)] = points[i].getX();
            result[1 + (i*2)] = points[i].getY();
        }

        return result;
    };
    

    /**
     * @returns {Number}
     */
    this.count = function() {
        return points.length;
    };

    if(_points && Array.isArray(_points)) {
        _points.forEach(self.push);
    }

};

export { PointSet };
