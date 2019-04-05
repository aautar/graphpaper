const SvgPathBuilder = {

    /**
     * 
     * @param {Point} _pt 
     * @returns {String}
     */
    pointToLineTo: function(_pt) {
        return "L" + _pt.getX() + " " + _pt.getY();
    },

    /**
     * 
     * @param {Point[]} _points 
     * @returns {String}
     */
    pointsToPath: function(_points) {
        const startPt = _points[0];

        const lineToString = [];
        for(let i=1; i<_points.length; i++) {
            const p = _points[i];
            lineToString.push(SvgPathBuilder.pointToLineTo(p));
        }
        
        const startCoordString = startPt.getX() + " " + startPt.getY();
        const pathString = 'M' + startCoordString + lineToString.join(" ");

        return pathString;
    },

};

export { SvgPathBuilder };
