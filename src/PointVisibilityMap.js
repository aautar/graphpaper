import {Point} from './Point';
import {Line} from './Line';
import {PointSet} from './PointSet';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {PointSet} _freePoints
 * @param {Line[]} _boundaryLines
 */
function PointVisibilityMap(_freePoints, _boundaryLines) {

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

        const freePointsArray = _freePoints.toArray();

        if(freePointsArray.length === 1) {
            pointToVisiblePointSet.set(freePointsArray[0], []);
            return;
        }

        for(let i=0; i<freePointsArray.length; i++) {
            for(let j=0; j<freePointsArray.length; j++) {
                if(i===j) {
                    continue;
                }

                // line representing line-of-sight between the 2 points
                const ijLine = new Line(freePointsArray[i], freePointsArray[j]);

                if(!doesLineIntersectAnyBoundaryLines(ijLine)) {
                    if(pointToVisiblePointSet.has(freePointsArray[i])) {
                        pointToVisiblePointSet.set(
                            freePointsArray[i], 
                            pointToVisiblePointSet.get(freePointsArray[i]).append(freePointsArray[j])
                        );
                    } else {
                        pointToVisiblePointSet.set(freePointsArray[i], [freePointsArray[j]]);
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

    /**
     * @param {Point} _startPoint
     * @param {Point} _endPoint
     * 
     * @return {PointSet}
     */
    this.computeRoute = function(_startPoint, _endPoint) {

        const resultSet = new PointSet();

        // if _startPoint has line-of-sight to _endPoint, return PointSet of [_startPoint, _endPoint]
        if(!doesLineIntersectAnyBoundaryLines(new Line(_startPoint, _endPoint))) {
            resultSet.push(_startPoint);
            resultSet.push(_endPoint);
            return resultSet;
        }

        // else find closest visible point in pointToVisiblePointSet
    };


    computePointsVisibility();

};
    
export { PointVisibilityMap };
