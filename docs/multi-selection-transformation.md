
### Enable multi-entity selection
Initialize multi-entity selection on a sheet:

```javascript
sheet.initMultiEntitySelectionHandler()
```

Clicking and dragging (or touching and dragging) on an empty area of the canvas will now create a selection rectangle, once the user is done (releases mouse button or end touch interaction), the canvas will emit a `SheetEvent.MULTIPLE_ENTITIES_SELECTED` event.

```javascript
sheet.on(GraphPaper.SheetEvent.MULTIPLE_ENTITIES_SELECTED, function(e) {
    console.log(e);
});
```

The event object (e) has 2 fields:
```javascript
{
    `selectedEntities`,     // entities within the selection rectangle
    `boundingRect`,         // a bounding rectangle around the selected entities
}
```

### Group (multi-entity) transformation
Group transformations are supported by creating a `GroupEncapsulationEntity`. This is an entity that contains a number of child entities, which are transformed when the entity itself is transformed.

> Currently only translations are supported.

> `GroupEncapsulationEntity` replaces the `GroupTransformationContainer` construct in earlier version of GraphPaper

```javascript
const encapsulationBox = new GraphPaper.GroupEncapsulationEntity(
    'encapsulation-box', 
    sheet,
    document.getElementById('encapsulation-box'),
    10
);
```

Typically you'll want to use a `GroupEncapsulationEntity` to respond to entity selection on a sheet. This requires listening for the `SheetEvent.MULTIPLE_ENTITIES_SELECTED` event and calling `GroupEncapsulationEntity.setEncapsulatedEntities()`:

```javascript
sheet.on(GraphPaper.SheetEvent.MULTIPLE_ENTITIES_SELECTED, function(e) {
    encapsulationBox.setEncapsulatedEntities(e.selectedObjects);
});
```
