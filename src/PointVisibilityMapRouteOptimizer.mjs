import { Point } from './Point.mjs';

const PointVisibilityMapRouteOptimizer = {

    /**
     * 
     * @param {Point[]} _pointsInRoute
     * @param {Function} _arePointsVisibleToEachOther
     */
    optimize: function(_pointsInRoute, _arePointsVisibleToEachOther) {
        let start = 0;
        let end = _pointsInRoute.length - 1;

        while(true) {
            if((end-start) <= 1) {
                start++;
                end = _pointsInRoute.length - 1;

                if(start >= _pointsInRoute.length-2) {
                    break;
                }
            }

            if(_arePointsVisibleToEachOther(_pointsInRoute[start], _pointsInRoute[end])) {
                _pointsInRoute.splice(start + 1, (end-start) - 1);
                end = _pointsInRoute.length - 1;
            } else {
                end--;
            }
        }
    }

};

export { PointVisibilityMapRouteOptimizer }
