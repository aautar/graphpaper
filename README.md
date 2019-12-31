# GraphPaper

[![CircleCI](https://circleci.com/gh/aautar/graphpaper.svg?style=svg)](https://circleci.com/gh/aautar/graphpaper)

GraphPaper helps with creating 2D, interactive, workspaces for web applications. It isn't an "out of the box" solution; GraphPaper takes over handling user interactions and transformations of objects, but markup and styling of those objects are left to the caller.

Very much a work-in-progress.

Used as the basis for sheets in [ScratchGraph](https://scratchgraph.com)

![graphpaper-connector](https://user-images.githubusercontent.com/12861733/33002147-358957a8-cd80-11e7-89ae-1b211c0eb2db.png)

## The Basics

Some DOM elements we'll use for GraphPaper.Canvas (`#paper`) and GraphPaper.CanvasObject (`#obj1`):

```html
<div id="paper">
    <div id="obj1" class="obj">
        <div id="translateHandle1" class="translateHandle"></div>
        <div id="resizeHandle1"  class="resizeHandle"></div>
        <div id="connectorAnchor1" class="connectorAnchor"></div>
    </div>
</div>
```

We'll assume styling/layout based on the CSS in [this example](https://github.com/aautar/graphpaper/blob/master/example/index.html).

Unless otherwise specified, units for size and positioning are [CSS pixels](https://www.w3.org/TR/CSS2/syndata.html#length-units).

### Create a canvas

```javascript
const canvas = new GraphPaper.Canvas(
    document.getElementById('paper'),                    // div to use
    window,                                              // parent window 
    new Worker('../dist/connector-routing-worker.js')    // required worker for connector routing
);

canvas.initTransformationHandlers();
```

The default, 12x12, dotted grid will be applied to the canvas.

###  Create an object

```javascript
const obj1 = new GraphPaper.CanvasObject(
    'obj1',                                             // id
    0,                                                  // x        
    0,                                                  // y
    44,                                                 // width
    44,                                                 // height
    canvas,                                             // parent GraphPaper.Canvas
    document.getElementById('obj1'),                    // object DOM element
    [document.getElementById('translateHandle1')],      // DOM elements for the object's translation handles
    [document.getElementById('resizeHandle1')]          // DOM elements for the object's resize handles
);
```

### Add the object to the canvas

```javascript
canvas.addObject(obj1);
```

The object (`obj1`) will be added to the canvas and can now be translated by dragging the translation handle (`#translateHandle1`) or resized with the resize handle (`#resizeHandle1`). GraphPaper will take care of both mouse and touch interactions on the handle elements.

### Get object(s)

To get a specific object by its ID:

```javascript
canvas.getObjectById(obj1.getId());
```

To get all objects on the canvas:

```javascript
canvas.getAllObjects();
```

To get all objects around a certain point:

```javascript
canvas.getObjectsAroundPoint(targetX, targetY, radius);
```

Note that this function tests for surrounding objects based on intersection of a box centered at (targetX, targetY) with the given radius.

### Remove the object from the canvas

```javascript
canvas.removeObject(obj1.getId());
```

The object (`obj1`) will "remove" the object from the canvas. Remove in this context means that the object will no longer be managed by the canvas, it won't respond to canvas changes and it won't emit object events.

Note that the caller is responsible for removing the object's DOM elements, due to the caller being responsible for the creation of the DOM elements.
 
### Get canvas dimensions

Get the width of a canvas:

```javascript
canvas.getWidth();
```

Get the height of a canvas:

```javascript
canvas.getHeight();
```

### Get canvas bounding box

```javascript
canvas.calcBoundingBox();
```

This methods will return a `Graphpaper.Rectangle` representing the "active" area of a canvas. The rectange will be [bounding box](https://en.wikipedia.org/wiki/Minimum_bounding_box) of the region containing objects on the canvas. If there are no objects on the canvas, the rectangle will represent the entire canvas.

### Change the grid

The grid rendered on a Canvas, along with the "snap to grid" behavior a Canvas will impart on objects, is set via the properties of a `Grid` object assigned to the Canvas.

A Grid is assigned/changed on a Canvas via the `Canvas.setGrid(_newGrid)` method.

A new Grid object is created as follows:
 
 `new Grid(12.0, '#424242', GRID_STYLE.DOT)`
(this is the default grid created and assigned to a Canvas upon construction)

The `Grid` constructor takes 3 parameters: the size of the grid, the color of the grid, and the style of the grid (GRID_STYLE.DOT or GRID_STYLE.LINE)

### Enable multi-object selection
Initialize multi-object selection on a canvas:

```javascript
canvas.initMultiObjectSelectionHandler()
```

Clicking and dragging (or touching and dragging) on an empty area of the canvas will now create a selection rectangle, once the user is done (releases mouse button or end touch interaction), the canvas will emit a `CanvasEvent.MULTIPLE_OBJECTS_SELECTED` event.

```javascript
canvas.on(GraphPaper.CanvasEvent.MULTIPLE_OBJECTS_SELECTED, function(e) {
    console.log(e);
});
```

The event object (e) has 2 fields:
- `selectedObjects` contains objects within the selection rectangle
- `boundingRect` is a bounding rectangle around the selected objects

### Group (multi-object) transformation
TBD

## Canvas Objects

### Get the position of an object

Get `x` (left) position of object:

```javascript
obj1.getX();
```

Get `y` (top) position of object:

```javascript
obj1.getY();
```

### Move an object

Programmatically move an object:

```javascript
obj1.translate(targetX, targetY);
```

### Get the size of an object

Get the width of an object:

```javascript
obj1.getWidth();
```

Get the height of an object:

```javascript
obj1.getHeight();
```

Get the bounding rectangle of an object:

```javascript
obj1.getBoundingRectange();
```

### Resize an object

Programmatically resize an object:

```javascript
obj1.resize(newWidth, newHeight);
```


## Events

### Add event handler

Use the `Canvas.on()` method to add an event handler

```javascript
canvas.on(GraphPaper.CanvasEvent.CLICK, (eventData) => {
    // a click on the Canvas
});
```

Events emitted:
- `CanvasEvent.DBLCLICK` ("dblclick")
- `CanvasEvent.CLICK` ("click")
- `CanvasEvent.CONNECTOR_UPDATED` ("connector-updated")
- `CanvasEvent.OBJECT_ADDED` ("object-added")
- `CanvasEvent.OBJECT_REMOVED` ("object-translated")
- `CanvasEvent.OBJECT_RESIZED` ("object-resized")
- `CanvasEvent.MULTIPLE_OBJECTS_SELECTED` ("multiple-objects-selected")

### Remove event handler

Use the `Canvas.off()` method to remove an event handler

```javascript
canvas.off(GraphPaper.CanvasEvent.CLICK, registeredCallbackFunction);
```
