import { MatrixMath } from './MatrixMath';

/**
 * 
 * @param {Number} _dblTapSpeed 
 * @param {Number} _dblTapRadius 
 */
function DoubleTapDetector(_dblTapSpeed, _dblTapRadius)
{
    const dblTapDetectVars = {
        lastTouchX: null,
        lastTouchY: null,
        lastTouchTime: null
    };
    
    let dblTapSpeed = _dblTapSpeed || 300.0;
    let dblTapRadius = _dblTapRadius || 24.0;

    /**
     * 
     * @param {TouchEvent} _touchEndEvent 
     * @param {Array} currentInvTransformationMatrix
     * @returns {Object}
     */
    this.processTap = function(_touchEndEvent, _currentInvTransformationMatrix) {
        if(_touchEndEvent.changedTouches.length === 0) {
            // we have nothing to work with
            return {
                "doubleTapDetected": false,
                "touchX": null,
                "touchY": null
            };
        }

        // Position of the touch
        const invTransformedPos = MatrixMath.vecMat4Multiply(
            [_touchEndEvent.changedTouches[0].pageX, _touchEndEvent.changedTouches[0].pageY, 0, 1],
            _currentInvTransformationMatrix
        );            

        let dblTapDetected = false;  // flag specifying if we detected a double-tap
        const x = invTransformedPos[0];
        const y = invTransformedPos[1];
        const now = new Date().getTime();

        // Check if we have stored data for a previous touch (indicating we should test for a double-tap)
        if(dblTapDetectVars.lastTouchTime !== null) {
            const lastTouchTime = dblTapDetectVars.lastTouchTime;

            // Compute time since the previous touch
            const timeSinceLastTouch = now - lastTouchTime;

            // Get the position of the last touch on the element
            const lastX = dblTapDetectVars.lastTouchX;
            const lastY = dblTapDetectVars.lastTouchY;

            // Compute the distance from the last touch on the element
            const distFromLastTouch = Math.sqrt( Math.pow(x-lastX,2) + Math.pow(y-lastY,2) );

            if(timeSinceLastTouch <= dblTapSpeed && distFromLastTouch <= dblTapRadius) {
                // Remove last touch info from element
                dblTapDetectVars.lastTouchTime = null;
                dblTapDetectVars.lastTouchX = null;
                dblTapDetectVars.lastTouchY = null;

                // Flag that we detected a double tap
                dblTapDetected = true;                
            }
        }

        if(!dblTapDetected) {
            dblTapDetectVars.lastTouchTime = now;
            dblTapDetectVars.lastTouchX = x;
            dblTapDetectVars.lastTouchY = y;
        }

        return {
            "doubleTapDetected": dblTapDetected,
            "touchX": x,
            "touchY": y
        }
    };
};

export { DoubleTapDetector };
