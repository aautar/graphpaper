import  {Point} from './Point';
import  {LINE_INTERSECTION_TYPE, LineIntersection} from './LineIntersection';

/**
 * 
 * @param {Point} _startPoint
 * @param {Point} _endPoint
 */
function Line(_startPoint, _endPoint) {   

    if(typeof _startPoint === 'undefined' || _startPoint === null) {
        throw "Line missing _startPoint";
    }

    if(typeof _endPoint === 'undefined' || _endPoint === null) {
        throw "Line missing _endPoint";
    }

    this.__startPoint = _startPoint;
    this.__endPoint = _endPoint;
};


/**
 * @returns {Point}
 */       
Line.prototype.getStartPoint = function() {
    return this.__startPoint;
};

/**
 * @returns {Point}
 */       
Line.prototype.getEndPoint = function() {
    return this.__endPoint;
};

/**
 * @param {Line} _otherLine
 * @returns {Boolean}
 */
Line.prototype.isEqual = function(_otherLine) {
    if(this.getStartPoint().isEqual(_otherLine.getStartPoint()) && this.getEndPoint().isEqual(_otherLine.getEndPoint())) {
        return true;
    }

    return false;
};

/**
 * @returns {Number}
 */
Line.prototype.getLength = function() {
    return Math.sqrt(
        Math.pow(this.__endPoint.getX() - this.__startPoint.getX(), 2) + Math.pow(this.__endPoint.getY() - this.__startPoint.getY(), 2)
    );
};

/**
 * Calculate unit length direction vector
 * 
 * @returns {Point}
 */
Line.prototype.getDirection = function() {
    const dx = this.__endPoint.getX() - this.__startPoint.getX();
    const dy = this.__endPoint.getY() - this.__startPoint.getY();

    const len = Math.sqrt(dx*dx + dy*dy);

    return new Point(       
        dx / len,
        dy / len
    );    
};

/**
 * Create a Line scaled by the specified scale factors
 * 
 * @returns {Line}
 */
Line.prototype.getCopyScaledRelativeToStart = function(scaleFactorEnd) {
    const dx = this.__endPoint.getX() - this.__startPoint.getX();
    const dy = this.__endPoint.getY() - this.__startPoint.getY();    

    return new Line(
        new Point(
            this.__startPoint.getX(), 
             this.__startPoint.getY()
        ),
        new Point(
            this.__startPoint.getX() + (scaleFactorEnd * dx), 
            this.__startPoint.getY() + (scaleFactorEnd * dy)
        )
    );
};

/**
 * @param {Line} _otherLine
 * @returns {LINE_INTERSECTION_TYPE}
 */
Line.prototype.computeIntersectionType = function(_otherLine) {
    const thisLineStartPointX = this.__startPoint.getX();
    const thisLineStartPointY = this.__startPoint.getY();
    const thisLineEndPointX = this.__endPoint.getX();
    const thisLineEndPointY = this.__endPoint.getY();        
    const otherLineStartPointX = _otherLine.getStartPoint().getX();
    const otherLineStartPointY = _otherLine.getStartPoint().getY();
    const otherLineEndPointX = _otherLine.getEndPoint().getX();
    const otherLineEndPointY = _otherLine.getEndPoint().getY();

    const paramDenom = (otherLineEndPointY-otherLineStartPointY)*(thisLineEndPointX-thisLineStartPointX) - (otherLineEndPointX-otherLineStartPointX)*(thisLineEndPointY-thisLineStartPointY);
    const paramANumer = (otherLineEndPointX-otherLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (otherLineEndPointY - otherLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);
    const paramBNumer = (thisLineEndPointX-thisLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (thisLineEndPointY-thisLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);

    if(paramDenom == 0) {
        if(paramDenom == 0 && paramANumer == 0 && paramBNumer==0)
            return LINE_INTERSECTION_TYPE.COINCIDENT;
        else
            return LINE_INTERSECTION_TYPE.PARALLEL;
    }

    const paramA = paramANumer / paramDenom;
    const paramB = paramBNumer / paramDenom;
    
    if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
        return LINE_INTERSECTION_TYPE.LINE;
    } else {
        return LINE_INTERSECTION_TYPE.LINESEG;
    }
};
    
/**
 * @param {Line} _otherLine
 * @returns {LINE_INTERSECTION_RESULT}
 */
Line.prototype.computeIntersection = function(_otherLine) {

    const thisLineStartPointX = this.__startPoint.getX();
    const thisLineStartPointY = this.__startPoint.getY();
    const thisLineEndPointX = this.__endPoint.getX();
    const thisLineEndPointY = this.__endPoint.getY();        
    const otherLineStartPointX = _otherLine.getStartPoint().getX();
    const otherLineStartPointY = _otherLine.getStartPoint().getY();
    const otherLineEndPointX = _otherLine.getEndPoint().getX();
    const otherLineEndPointY = _otherLine.getEndPoint().getY();

    const paramDenom = (otherLineEndPointY-otherLineStartPointY)*(thisLineEndPointX-thisLineStartPointX) - (otherLineEndPointX-otherLineStartPointX)*(thisLineEndPointY-thisLineStartPointY);
    const paramANumer = (otherLineEndPointX-otherLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (otherLineEndPointY - otherLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);
    const paramBNumer = (thisLineEndPointX-thisLineStartPointX)*(thisLineStartPointY-otherLineStartPointY) - (thisLineEndPointY-thisLineStartPointY)*(thisLineStartPointX-otherLineStartPointX);

    if(paramDenom == 0) {
        if(paramDenom == 0 && paramANumer == 0 && paramBNumer==0)
            return new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT, null);
        else
            return new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL, null);
    }

    const paramA = paramANumer / paramDenom;
    const paramB = paramBNumer / paramDenom;

    const xIntersect = this.__startPoint.getX() + paramA*(this.__endPoint.getX()-this.__startPoint.getX());
    const yIntersect = this.__startPoint.getY() + paramA*(this.__endPoint.getY()-this.__startPoint.getY());
    
    if(paramA > 1.0 || paramA < 0.0 || paramB > 1.0 || paramB < 0.0) {
        return new LineIntersection(LINE_INTERSECTION_TYPE.LINE, new Point(xIntersect, yIntersect));
    } else {
        return new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG, new Point(xIntersect, yIntersect));
    }
};

export { Line };
