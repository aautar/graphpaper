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

    const doesLineIntersectAnyBoundaryLines = function() {
        for(let b=0; b<_boundaryLines.length; b++) {
            const intersection = _boundaryLines[b].computeIntersection(ijLine);
            if(intersection.getType() === LINE_INTERSECTION_TYPE.LINESEG) {
                return true;
            }
        };

        return false;
    };

    const computePointsVisibility = function() {
        for(let i=0; i<_allPoints.length; i++) {
            for(let j=0; j<_allPoints.length; j++) {
                if(i===j) {
                    continue;
                }

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

    computePointsVisibility();

};
    
export { PointVisibilityMap };
