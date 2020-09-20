import { Line } from "./Line";

const SvgPathBuilder = {

    /**
     * 
     * @param {Point} _pt 
     * @returns {String}
     */
    pointToLineTo: function(_pt, _ptIndex) {
        if(_ptIndex === 0) {
            return "M" + _pt.getX() + " " + _pt.getY();
        }

        return "L" + _pt.getX() + " " + _pt.getY();
    },

    /**
     * 
     * @param {Point[]} _points 
     * @param {Number} _curvaturePx 
     * @returns {Point[]}
     */
    pointTripletToTesselatedCurvePoints(_points, _curvaturePx) {
        if(_points.length !== 3) {
            throw new Error("_points must be array of exactly 3 points");
        }

        const controlPoint = _points[1];

        const lineA = new Line(_points[0], _points[1]);
        const lineB = new Line(_points[1], _points[2]);

        const lineAShortened = lineA.createShortenedLine(0, _curvaturePx * 0.5);
        const lineBShortened = lineB.createShortenedLine(_curvaturePx * 0.5, 0);

        return [
            lineAShortened.getStartPoint(),
            lineAShortened.getEndPoint(),
            lineBShortened.getStartPoint(),
            lineBShortened.getEndPoint(),
        ];
    },

    /**
     * 
     * @param {Point[]} _points
     * @param {Number} _curvaturePx
     * @returns {String}
     */
    pointsToPath: function(_points, _curvaturePx) {
        _curvaturePx = _curvaturePx || 0.0;

        const svgPathParts = [];
        let ptIdx = 0; // minify bug if this is put within the if(_curvaturePx... block

        if(_curvaturePx > 0.0) {
            while(_points.length >= 3) {
                const ptA = _points.shift();
                const ptB = _points.shift();
                const ptC = _points.shift();

                const newPts = SvgPathBuilder.pointTripletToTesselatedCurvePoints(
                    [
                        ptA,
                        ptB,
                        ptC,
                    ],
                    _curvaturePx
                );                

                _points.unshift(newPts[3]);
                _points.unshift(newPts[2]);

                for(let j=0; j<newPts.length-2; j++) {
                    svgPathParts.push(SvgPathBuilder.pointToLineTo(newPts[j], ptIdx++));
                }
            }

            while(_points.length > 0) {
                const pt = _points.shift();
                svgPathParts.push(SvgPathBuilder.pointToLineTo(pt, ptIdx++));
            }

        } else {
            for(let i=0; i<_points.length; i++) {
                const p = _points[i];
                svgPathParts.push(SvgPathBuilder.pointToLineTo(p, i));
            }
        }

        return svgPathParts.join(" ");        
    },

};

export { SvgPathBuilder };
