
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
- `selectedEntities` contains entities within the selection rectangle
- `boundingRect` is a bounding rectangle around the selected entities

### Group (multi-entity) transformation
TBD
