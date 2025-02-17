import { Entity } from "./Entity.mjs";
import { Point } from "./Point.mjs";

/**
 * 
 * @param {Entity} _entity 
 * @param {Point} _pointerDragStartPosition 
 * @param {Point} _entityDragStartPosition 
 */
function DragContext(_entity, _pointerDragStartPosition, _entityDragStartPosition)  {
    let curDragX = 0.0;
    let curDragY = 0.0;

    const pointerOffsetFromEntity = new Point(
        _pointerDragStartPosition.getX() - _entityDragStartPosition.getX(),
        _pointerDragStartPosition.getY() - _entityDragStartPosition.getY()
    );

    /**
     * 
     * @returns {String}
     */
    this.getEntity = function() {
        return _entity;
    };

    /**
     * 
     * @returns {Point}
     */
    this.getPointerDragStartPosition = function() {
        return _pointerDragStartPosition;
    };

    /**
     * 
     * @returns {Point}
     */
    this.getEntityDragStartPosition = function() {
        return _entityDragStartPosition;
    };

    /**
     * 
     * @param {Number} _x 
     * @param {Number} _y 
     */
    this.setCurrentDragPosition = function(_x, _y) {
        curDragX = _x;
        curDragY = _y;
    };

    /**
     * 
     * @returns {Point}
     */
    this.getCurrentDragPosition = function() {
        return new Point(curDragX, curDragY);
    };

    /**
     * 
     * @returns {Point}
     */
    this.getPointerOffsetFromEntityPosition = function() {
        return pointerOffsetFromEntity;
    };
};

export { DragContext }
