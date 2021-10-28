
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
Group transformations are supported by creating a `GroupTransformationContainer` with a set of entities and attaching it to a sheet via `Sheet.attachGroupTransformationContainer()`. 

Currently only translations are supported on containers, which is enabled by calling `GroupTransformationContainer.initTranslateInteractionHandler()`.

```javascript
const container = new GraphPaper.GroupTransformationContainer(sheet, entities);
container.initTranslateInteractionHandler();
sheet.attachGroupTransformationContainer(container);
```

Typically you'll want to use a `GroupTransformationContainer` to respond to entity selection on a sheet. This requires listening for the `SheetEvent.MULTIPLE_ENTITIES_SELECTED` event, detaching any current container on the sheet, creating a new container, then attaching the new container.

```javascript
let currentContainer = null;
sheet.on(GraphPaper.SheetEvent.MULTIPLE_ENTITIES_SELECTED, (e) => {
    // clear any current group transformation containers
    if(currentContainer) {
        sheet.detachGroupTransformationContainer(currentContainer);
    }

    // create new GroupTransformationContainer..
    currentContainer = new GraphPaper.GroupTransformationContainer(sheet, e.selectedObjects);
    currentContainer.initTranslateInteractionHandler();
    sheet.attachGroupTransformationContainer(currentContainer);
});
```
