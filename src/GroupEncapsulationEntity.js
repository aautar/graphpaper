import {Entity} from './Entity';
import { Originator } from './Originator';
import {Rectangle} from './Rectangle';

/**
 * 
 * @param {String} _id
 * @param {Sheet} _sheet
 * @param {Element} _domElement
 * @param {Number} _sizeAdjustmentPx
 * 
 **/
function GroupEncapsulationEntity(_id, _sheet, _domElement, _sizeAdjustmentPx)  {

    const self = this;
    const encapsulatedEntities = [];

    Entity.call(
        this,
        _id, 
        0, 
        0, 
        0, 
        0, 
        _sheet, 
        _domElement, 
        [_domElement], 
        []
    );

    const parentTranslate = this.translate;

    self.setAllowedWithinMultiEntitySelection(false);
    self.setAllowedWithinCluster(false);

    /**
     * 
     * @returns {Rectangle}
     */
    const calculateBoundingRect = function() {
        let r = _sheet.calcBoundingRectForEntities(encapsulatedEntities);
        if(r.getWidth() === 0 || r.getHeight() === 0) {
            return r; // don't bother with size adjustment if the box has no dimension
        }

        if(_sizeAdjustmentPx) {
            r = r.getUniformlyResizedCopy(_sizeAdjustmentPx);
        }

        return r;
    };

    const clearEncapsulatedEntities = function() {
        encapsulatedEntities.length = 0;
    };

    /**
     * @param {Number} _x
     * @param {Number} _y
     * @param {Originator} [_originator=Originator.PROGRAM]
     */
    this.translate = function(_x, _y, _originator) {
        const dx = _x - self.getX();
        const dy = _y - self.getY();

        //
        // Always translate the encapsulted entities first...
        //
        const originatorForSubEntities = (_originator === Originator.USER) ? Originator.USER_VIA_PARENT_ENTITY : Originator.PROGRAM_VIA_PARENT_ENTITY; 
        encapsulatedEntities.forEach((_subEntity) => {
            _subEntity.translate(
                _subEntity.getX() + dx,
                _subEntity.getY() + dy,
                true,
                originatorForSubEntities,
            );
        });

        //
        // .. b/c the translate event from this entity will trigger connector and cluster refreshes 
        // .. (since _withinGroupTransformation is false)
        //
        parentTranslate(_x, _y, false, _originator);
    };

    /**
     * 
     * @param {Entity[]} _encapsulatedEntities 
     */
    this.setEncapsulatedEntities = function(_encapsulatedEntities) {

        /**
         * @todo validate that _encapsulatedEntities does not contain this entity
         */

        clearEncapsulatedEntities();
        encapsulatedEntities.push(..._encapsulatedEntities);

        const bbox = calculateBoundingRect();

        parentTranslate(bbox.getLeft(), bbox.getTop(), false, Originator.PROGRAM);
        self.resize(bbox.getWidth(), bbox.getHeight());
    };
};


GroupEncapsulationEntity.prototype = Object.create(Entity.prototype);
GroupEncapsulationEntity.prototype.constructor = GroupEncapsulationEntity;

export { GroupEncapsulationEntity }
