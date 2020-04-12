import {Dimensions, DoubleTapDetector} from '../src/DoubleTapDetector'

describe("DoubleTapDetector.processTap", function() {
    it("return no double-tap detected if no changed touches in event", function() {
        const currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];        
        const touchEvent = {
            "changedTouches": []
        };

        const detector = new DoubleTapDetector(200, 20.0);
        const detectResult = detector.processTap(touchEvent, currentInvTransformationMatrix);
        expect(detectResult.doubleTapDetected).toBe(false);
    });

    it("detects double-tap", function() {
        const currentInvTransformationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];        
        const touchEvent = {
            "changedTouches": [{"pageX":100, "pageY":200}],
        };

        const detector = new DoubleTapDetector(200, 20.0);
        const detectResultA = detector.processTap(touchEvent, currentInvTransformationMatrix);
        const detectResultB = detector.processTap(touchEvent, currentInvTransformationMatrix);

        expect(detectResultB.doubleTapDetected).toBe(true);
    });    
});
