## Entity events

An Entity can emit a number of different events which consumers can subscribe to.

## Add event handler

Use the `Entity.on()` method to add an event handler

```javascript
entity.on(GraphPaper.EntityEvent.TRANSLATE, (eventData) => {
    // entity has been translated
});
```

## Remove event handler

Use the `Entity.off()` method to remove an event handler

```javascript
sheet.off(GraphPaper.EntityEvent.TRANSLATE, registeredCallbackFunction);
```

## Events emitted

### `EntityEvent.TRANSLATE_START`
Emitted when the user has performed an action to begin translation of the entity (typically clicking down or touching the a translation handle on the Entity)

The event object contains the following fields:
```javascript
EntityEvent.x           // x position of the entity
EntityEvent.y           // y position of the entity
EntityEvent.isTouch     // is this a touch-based translation?
```

### `EntityEvent.TRANSLATE`
Emitted when the entity has been translated, either by a user action or programmatically (via direct call to `Entity.translate()` method).

The event object contains the following fields:
```javascript
EntityEvent.x                               // x position of the entity
EntityEvent.y                               // y position of the entity
EntityEvent.withinGroupTransformation       // was the entity translated as part of a group?
```

### `EntityEvent.RESIZE_START`
Emitted when the user has performed an action to begin resize of the entity (typically clicking down or touching the a resize handle on the Entity)

The event object contains the following fields:
```javascript
EntityEvent.x               // x position of the entity
EntityEvent.y               // y position of the entity
EntityEvent.resizeCursor    // the cursor CSS property being used for the resize
EntityEvent.isTouch         // is this a touch-based translation?
```

### `EntityEvent.TRANSLATE`
Emitted when the entity has been resized, either by a user action or programmatically (via direct call to `Entity.resize()` method).

The event object contains the following fields:
```javascript
EntityEvent.width       // new width of the entity
EntityEvent.height      // new height of the entity
```
