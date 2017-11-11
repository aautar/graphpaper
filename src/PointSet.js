import  {Point} from './Point';

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
     * @returns {Point[]}
     */
    this.toArray = function() {
        return points;
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
