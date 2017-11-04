import  {Point} from './Point';

/**
 * Unique collection of Point objects
 */
function PointSet() {

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

};

export { PointSet };
