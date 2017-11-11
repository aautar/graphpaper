import  {Point} from './Point';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {Point} _startPoint
 * @param {Point} _endPoint
 */
function Line(_startPoint, _endPoint) {   
    /**
     * @returns {Point}
     */       
    this.getStartPoint = function() {
        return _startPoint;
    };

    /**
     * @returns {Point}
     */       
    this.getEndPoint = function() {
        return _endPoint;
    };

    /**
     * @returns {Number}
     */
    this.getLength = function() {
        return Math.sqrt(
            Math.pow(_endPoint.getX() - _startPoint.getX(), 2) + Math.pow(_endPoint.getY() - _startPoint.getY(), 2)
        );
    };

    /**
     * @param {Line} _otherLine
     * @returns {LINE_INTERSECTION_RESULT}
     */
    this.computeIntersection = function(_otherLine) {
        const paramDenom = (_otherLine.getEndPoint().getY()-_otherLine.getStartPoint().getY())*(_endPoint.getX()-_startPoint.getX()) - (_otherLine.getEndPoint().getX()-_otherLine.getStartPoint().getX())*(_endPoint.getY()-_startPoint.getY());
        const paramANumer = (_otherLine.getEndPoint().getX()-_otherLine.getStartPoint().getX())*(_startPoint.getY()-_otherLine.getStartPoint().getY()) - (_otherLine.getEndPoint().getY() - _otherLine.getStartPoint().getY())*(_startPoint.getX()-_otherLine.getStartPoint().getX());
        const paramBNumer = (_endPoint.getX()-_startPoint.getX())*(_startPoint.getY()-_otherLine.getStartPoint().getY()) - (_endPoint.getY()-_startPoint.getY())*(_startPoint.getX()-_otherLine.getStartPoint().getX());
    
        if(paramDenom == 0) {
            if(paramDenom == 0 && paramANumer == 0 && paramBNumer==0)
                return new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT, null);
            else
                return new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL, null);
        }

        const paramA = paramANumer / paramDenom;
        const paramB = paramBNumer / paramDenom;
    
        const xIntersect = _startPoint.getX() + paramA*(_endPoint.getX()-_startPoint.getX());
        const yIntersect = _startPoint.getY() + paramA*(_endPoint.getY()-_startPoint.getY());
       
        if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
            return new LineIntersection(LINE_INTERSECTION_TYPE.LINE, new Point(xIntersect, yIntersect));
        } else {
            return new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG, new Point(xIntersect, yIntersect));
        }
    };
};

export { Line };
