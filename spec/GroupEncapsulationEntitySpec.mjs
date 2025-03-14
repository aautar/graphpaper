import { JSDOM } from 'jsdom';
import { Entity } from '../src/Entity.mjs';
import { EntityEvent } from '../src/EntityEvent.mjs';
import { GroupEncapsulationEntity } from '../src/GroupEncapsulationEntity.mjs';
import { Rectangle } from '../src/Rectangle.mjs';

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const window = dom.window;
global.requestAnimationFrame = (_render) => { _render(); };
global.cancelAnimationFrame = () => { };

const sheet = {
    getGridSize: function () {
        return 12.0;
    },

    snapToGrid: function(_p) {
        var ret = Math.round(_p/sheet.getGridSize()) * sheet.getGridSize();
        return Math.max(0, ret - 1);
    },

    /**
     * @todo figure out a better solution here, we're just copying the method from Sheet
     */
    calcBoundingRectForEntities: function (_entities) {
        var minTop = null;
        var minLeft = null;
        var maxBottom = null;
        var maxRight = null;

        _entities.forEach(function (_obj, index, array) {
            const objRect = _obj.getBoundingRectange();
            const left = objRect.getLeft();
            const top = objRect.getTop();
            const right = objRect.getRight();
            const bottom = objRect.getBottom();

            if (minLeft === null || left < minLeft) {
                minLeft = left;
            }

            if (minTop === null || top < minTop) {
                minTop = top;
            }

            if (maxBottom === null || bottom > maxBottom) {
                maxBottom = bottom;
            }

            if (maxRight === null || right > maxRight) {
                maxRight = right;
            }
        });

        if (minTop === null || minLeft === null || maxBottom === null || maxRight === null) {
            minTop = 0;
            minLeft = 0;
            maxBottom = 0;
            maxRight = 0;
        }

        return new Rectangle(minLeft, minTop, maxRight, maxBottom);
    }
};

const getEntitiesToEncapsulate = function () {
    const entity1 = new Entity(
        "obj-123",
        100,
        200,
        10,
        20,
        sheet,
        window.document.createElement('div'),
        [window.document.createElement('div')],
        [window.document.createElement('div')]
    );

    const entity2 = new Entity(
        "obj-456",
        300,
        200,
        10,
        20,
        sheet,
        window.document.createElement('div'),
        [window.document.createElement('div')],
        [window.document.createElement('div')]
    );

    return [entity1, entity2];
};

describe("GroupEncapsulationEntity constructor", function () {
    it("creates zero dimensional DOM element", function () {
        const objDomElem = window.document.createElement('div');
        const o = new GroupEncapsulationEntity(
            "obj-123",
            sheet,
            objDomElem
        );

        expect(objDomElem.style.width).toBe('0px');
        expect(objDomElem.style.height).toBe('0px');
    });
});

describe("GroupEncapsulationEntity.setEncapsulatedEntities", function () {
    it("positions and sizes entity DOM element around entities", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        encapsulationEntity.setEncapsulatedEntities(getEntitiesToEncapsulate());

        expect(objDomElem.style.left).toBe('100px');
        expect(objDomElem.style.top).toBe('200px');
        expect(objDomElem.style.width).toBe('210px');
        expect(objDomElem.style.height).toBe('20px');
    });

    it("positions and sizes entity DOM element around entities, with given size adjustment", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem,
            10
        );

        encapsulationEntity.setEncapsulatedEntities(getEntitiesToEncapsulate());

        expect(objDomElem.style.left).toBe('90px');
        expect(objDomElem.style.top).toBe('190px');
        expect(objDomElem.style.width).toBe('230px');
        expect(objDomElem.style.height).toBe('40px');
    });
});

describe("GroupEncapsulationEntity.translate", function () {
    it("translates all encapsulated entities", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        const encapsulatedEntities = getEntitiesToEncapsulate();
        encapsulationEntity.setEncapsulatedEntities(encapsulatedEntities);

        encapsulationEntity.translate(50, 20);

        expect(encapsulatedEntities[0].getX()).toBe(47);
        expect(encapsulatedEntities[0].getY()).toBe(23);

        expect(encapsulatedEntities[1].getX()).toBe(251);
        expect(encapsulatedEntities[1].getY()).toBe(23);
    });

    it("translates all encapsulated entities such that they are snapped to the Sheet grid", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem,
            7
        );

        const encapsulatedEntity = new Entity(
            "obj-123",
            12,
            12,
            12,
            12,
            sheet,
            window.document.createElement('div'),
            [window.document.createElement('div')],
            [window.document.createElement('div')]
        );

        encapsulationEntity.setEncapsulatedEntities([encapsulatedEntity]);
        encapsulationEntity.translate(13, 32);

        expect(encapsulatedEntity.getX()).toBe(23); // 20 = position of encapsulation entity (13) + entity's x-distance from encapsulation entity (7) = (20) -> snapped to 12px grid -> 23
        expect(encapsulatedEntity.getY()).toBe(35); // 20 = position of encapsulation entity (32) + entity's x-distance from encapsulation entity (7) = (39) -> snapped to 12px grid -> 35
    });

    it("emits EntityEvent.TRANSLATE event, with withinGroupTransformation set to false", function (done) {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        encapsulationEntity.setEncapsulatedEntities(getEntitiesToEncapsulate());

        encapsulationEntity.on(EntityEvent.TRANSLATE, function (_e) {
            expect(_e.withinGroupTransformation).toBe(false);
            done();
        });

        encapsulationEntity.translate(50, 20);
    });

    it("emits EntityEvent.TRANSLATE event for encapsulated entities, with withinGroupTransformation set to true", function (done) {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        const encapsulatedEntities = getEntitiesToEncapsulate();
        encapsulationEntity.setEncapsulatedEntities(encapsulatedEntities);

        encapsulatedEntities[0].on(EntityEvent.TRANSLATE, function (_e) {
            expect(_e.withinGroupTransformation).toBe(true);
            done();
        });

        encapsulationEntity.translate(50, 20);
    });
});

describe("GroupEncapsulationEntity.getEncapsulatedEntities", function () {
    it("returns array of encapsulated entities", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        const encapsulatedEntities = getEntitiesToEncapsulate();
        encapsulationEntity.setEncapsulatedEntities(encapsulatedEntities);

        expect(encapsulationEntity.getEncapsulatedEntities()).toContain(...encapsulatedEntities);
    });
});

describe("GroupEncapsulationEntity.getBoundingRect", function () {
    it("returns Rectangle with bound of encapsulated entities", function () {
        const objDomElem = window.document.createElement('div');
        const encapsulationEntity = new GroupEncapsulationEntity(
            "encapsulation-entity",
            sheet,
            objDomElem
        );

        const encapsulatedEntities = getEntitiesToEncapsulate();
        encapsulationEntity.setEncapsulatedEntities(encapsulatedEntities);

        const boundingRect = encapsulationEntity.getBoundingRect();
        expect(boundingRect.getLeft()).toBe(100);
        expect(boundingRect.getTop()).toBe(200);
        expect(boundingRect.getRight()).toBe(310);
        expect(boundingRect.getBottom()).toBe(220);
    });
});
