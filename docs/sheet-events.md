# Sheet Events

A Sheet can emit a number of different events which consumers can subscribe to. Note that all the event identifies correspond to strings, however, it is recommended to use the identifies to prevent disruption in the event that the underlying string changes.

## Adding & removing event handlers

Use the `Sheet.on()` method to add an event handler:

```javascript
sheet.on(GraphPaper.SheetEvent.CLICK, (eventData) => {
    // a click occured
});
```

Use the `Sheet.off()` method to remove an event handler:

```javascript
sheet.off(GraphPaper.SheetEvent.CLICK, registeredCallbackFunction);
```

## Interaction events

### `SheetEvent.CLICK`
Emitted when the user clicks or taps anywhere on the sheet

The event object contains the following fields:
```javascript
SheetEvent.targetPoint      // GraphPaper.Point of the clicked location
SheetEvent.entityClicked    // Entity object if an entity was clicked, null otherwise
```


### `SheetEvent.DBLCLICK`
Emitted when the user double-clicks or double-taps an empty area of the sheet

The event object contains the following fields:
```javascript
SheetEvent.targetPoint              // GraphPaper.Point of the double-clicked location
SheetEvent.entitiesAroundPoint      // Array with entities at/around the double-clicked location (within 1px)
```

### `SheetEvent.MULTIPLE_ENTITIES_SELECTED`
Emitted when a selection box, *possibly* containing multiple entities, has been created

The event object contains the following fields:
```javascript
SheetEvent.selectedEntities     // Array of entities within the selection box
SheetEvent.boundingRect         // GraphPaper.Rectangle representing the selection box
```

### `SheetEvent.MULTIPLE_ENTITY_SELECTION_STARTED`
Emitted when the user has triggered the creation of a selection box (typically by pressing and holding the the primary mouse button)

The event object contains the following fields:
```javascript
SheetEvent.x     // x-coordinate where selection box creation started
SheetEvent.y     // y-coordinate where selection box creation started
```

## Entity events

### `SheetEvent.ENTITY_ADDED`
Emitted when an entity has been added to the sheet

The event object contains the following fields:
```javascript
SheetEvent.object   // The Entity that was added to the Sheet
```

### `SheetEvent.ENTITY_REMOVED`
Emitted when an entity has been removed from the sheet

The event object contains the following fields:
```javascript
SheetEvent.object   // The Entity that was removed from the Sheet
```

### `SheetEvent.ENTITY_RESIZED`
Emitted when an entity has been resized

The event object contains the following fields:
```javascript
SheetEvent.object   // The Entity that has been resized
```

### `SheetEvent.ENTITY_TRANSLATED`
Emitted when an entity has been translated

The event object contains the following fields:
```javascript
SheetEvent.object                       // The Entity that has been translated
SheetEvent.withinGroupTransformation    // Flag indicating if the translation was part of a group transformation
```

## Connector events
### `SheetEvent.CONNECTOR_UPDATED`
Emitted when a connector connecting entities has been updated in some way

The event object contains the following fields:
```javascript
SheetEvent.connector    // The connector that was updated
```