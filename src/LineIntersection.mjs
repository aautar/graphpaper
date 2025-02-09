import { Point } from './Point.mjs';

const LINE_INTERSECTION_TYPE = Object.freeze({
	PARALLEL: "parallel",		// no intersection, lines are parallel
    COINCIDENT: "coincident",	// no intersection, lines are coincident
	LINE: "line",				// the lines intersect, but the intersection point is beyond the bounds of the line segments
	LINESEG: "lineseg",			// the lines intersect, and the intersection point is within the bounds of the line segments
});

/**
 * 
 * @param {LINE_INTERSECTION_TYPE} _type 
 * @param {Point} _intersectionPoint 
 */
function LineIntersection(_type, _intersectionPoint) {
    this.__type = _type;
    this.__intersectionPoint = _intersectionPoint;
};


/**
 * @returns {LINE_INTERSECTION_TYPE}
 */
LineIntersection.prototype.getType = function() {
    return this.__type;
};

/**
 * @returns {Point|null}
 */
LineIntersection.prototype.getIntersectionPoint = function() {
    return this.__intersectionPoint;
};

export {LINE_INTERSECTION_TYPE, LineIntersection};
