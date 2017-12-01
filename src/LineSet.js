import  {Line} from './Line';

/**
 * Unique collection of Line objects
 * 
 * @param {Line[]|undefined} _lines
 */
function LineSet(_lines) {
    
    const self = this;
    
    /**
     * @type {Line[]}
     */
    const lines = [];    

    /**
     * @param {Line} _newLine
     */
    this.push = function(_newLine) {
        var alreadyInLinesArray = false;
        lines.forEach(function(_existingLine) {
            if(_newLine.isEqual(_existingLine)) {
                alreadyInLinesArray = true;
            }
        });        

        if(alreadyInLinesArray) {
            return false;
        }

        lines.push(_newLine);
        return true;
    };
  
    /**
     * @returns {Line[]}
     */
    this.toArray = function() {
        return lines;
    };

    /**
     * @returns {Number}
     */
    this.count = function() {
        return points.length;
    };

    if(_lines && Array.isArray(_lines)) {
        _lines.forEach(self.push);
    }  
};
