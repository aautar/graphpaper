# Sheet Events

A Sheet can emit a number of different events which consumers can subscribe to.

## Add event handler

Use the `Sheet.on()` method to add an event handler

```javascript
sheet.on(GraphPaper.SheetEvent.CLICK, (eventData) => {
    // a click occured
});
```

## Remove event handler

Use the `Sheet.off()` method to remove an event handler

```javascript
sheet.off(GraphPaper.SheetEvent.CLICK, registeredCallbackFunction);
```

## Events emitted

### `SheetEvent.CLICK`
Emitted when the user clicks or taps an empty area of the sheet

### `SheetEvent.DBLCLICK`
Emitted when the user double-clicks or double-taps an empty area of the sheet

### `SheetEvent.CONNECTOR_UPDATED`
Emitted when a connector connecting entities has been updated in some way

### `SheetEvent.OBJECT_ADDED`
Emitted when an entity has been added to the sheet

### `SheetEvent.OBJECT_REMOVED`
Emitted when an entity has been removed from the sheet

### `SheetEvent.OBJECT_RESIZED`
Emitted when an entity has been resized

### `SheetEvent.MULTIPLE_OBJECTS_SELECTED`
Emitted when a selection box, *possibly* containing multiple entities, has been created


(Note that all the event identifies correspond to strings, however, it is recommended to use the identifies)
