
## Enable multi-entity selection
Initialize multi-entity selection on a sheet:

```javascript
sheet.initMultiEntitySelectionHandler()
```

Clicking and dragging (or touching and dragging) on an empty area of the canvas will now create a selection rectangle, once the user is done (releases mouse button or ends touch interaction), the `Sheet` will emit a `SheetEvent.MULTIPLE_ENTITIES_SELECTED` event.

```javascript
sheet.on(GraphPaper.SheetEvent.MULTIPLE_ENTITIES_SELECTED, function(e) {
    console.log(e);
});
```

The event object (e) has 2 fields:
```typescript
{
    selectedEntities: GraphPaper.Entity[],     // entities within the selection rectangle
    boundingRect: GraphPaper.Rectange,         // a bounding rectangle around the selected entities
}
```

## Group (multi-entity) transformation
Group transformations are supported by creating a `GroupEncapsulationEntity`. This is an entity that contains a number of child entities, which are transformed when the entity itself is transformed.

> Currently only translations are supported.

> `GroupEncapsulationEntity` replaces the `GroupTransformationContainer` construct in earlier version of GraphPaper

```javascript
// Create the Entity...
const encapsulationBox = new GraphPaper.GroupEncapsulationEntity(
    'encapsulation-box', 
    sheet,
    document.getElementById('encapsulation-box'),
    10
);

// Add it to a Sheet...
sheet.addEntity(encapsulationBox);
```

Typically you'll want to use a `GroupEncapsulationEntity` to respond to entity selection on a sheet. This requires listening for the `SheetEvent.MULTIPLE_ENTITIES_SELECTED` event and calling `GroupEncapsulationEntity.setEncapsulatedEntities()`:

```javascript
sheet.on(GraphPaper.SheetEvent.MULTIPLE_ENTITIES_SELECTED, function(e) {
    encapsulationBox.setEncapsulatedEntities(e.selectedObjects);
});
```

#### Get encapsulated entities

To retrieve entities within a `GroupEncapsulationEntity` call `getEncapsulatedEntities()`:

```javascript
encapsulationBox.getEncapsulatedEntities();
```

#### Get bounding rectangle

To retrieve a `Rectange` representing the bounds of all encapsulated entities (including whatever size adjustment was specified when constructing the `GroupEncapsulationEntity`), call `getBoundingRect()`:

```javascript
encapsulationBox.getBoundingRect();
```
