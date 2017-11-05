import {Point} from './Point';
import {Line} from './Line';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {Point[]} _allPoints
 * @param {Line[]} _boundaryLines
 */
function PointVisibilityMap(_allPoints, _boundaryLines) {

    /**
     * @type Map<Point,Point[]>
     */
    const pointToVisiblePointSet = new Map();

    /**
     * @param {Line} _theLine
     * @returns {Boolean}
     */
    const doesLineIntersectAnyBoundaryLines = function(_theLine) {
        for(let b=0; b<_boundaryLines.length; b++) {
            const intersection = _boundaryLines[b].computeIntersection(_theLine);
            if(intersection.getType() === LINE_INTERSECTION_TYPE.LINESEG) {
                return true;
            }
        };

        return false;
    };

    const computePointsVisibility = function() {

        if(_allPoints.length === 1) {
            pointToVisiblePointSet.set(_allPoints[0], []);
            return;
        }

        for(let i=0; i<_allPoints.length; i++) {
            for(let j=0; j<_allPoints.length; j++) {
                if(i===j) {
                    continue;
                }

                // line representing line-of-sight between the 2 points
                const ijLine = new Line(_allPoints[i], _allPoints[j]);

                if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                    if(pointToVisiblePointSet.has(_allPoints[i])) {
                        pointToVisiblePointSet.set(
                            _allPoints[i], 
                            pointToVisiblePointSet.get(_allPoints[i]).append(_allPoints[j])
                        );
                    } else {
                        pointToVisiblePointSet.set(_allPoints[i], [_allPoints[j]]);
                    }
                    
                }
            }
        }
    };


    /**
     * @param {Point} _point
     * @returns {Point|null}
     */
    this.findVisiblePointClosestTo = function(_point) {

        var resultPoint = null;
        var currentMaxLength = Number.MAX_SAFE_INTEGER;

        pointToVisiblePointSet.forEach(function(_visiblePoints, _ptKey) {
            const lineOfSight = new Line(_point, _ptKey);
            if(!doesLineIntersectAnyBoundaryLines(lineOfSight)) {
                if(lineOfSight.getLength() < currentMaxLength) {
                    resultPoint = _ptKey;
                    currentMaxLength = lineOfSight.getLength();
                }
            };
        });
        
        return resultPoint;
    };

    this.computeRoute = function(_startPoint, _endPoint) {
        // if _startPoint has line-of-sight to _endPoint, return [_startPoint, _endPoint]

        // else find closest visible point in pointToVisiblePointSet
    };


    computePointsVisibility();

};
    
export { PointVisibilityMap };
