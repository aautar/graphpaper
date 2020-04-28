# GraphPaper

[![CircleCI](https://circleci.com/gh/aautar/graphpaper.svg?style=svg)](https://circleci.com/gh/aautar/graphpaper)

GraphPaper is a library for creating 2D interactive workspaces in web application. It isn't an out-of-the-box solution, a lot of implementation details are pushed to consumers. Typically, GraphPaper serves as a foundation for handling user interactions and transformation of objects, but markup and styling of those objects are left to the caller whenever possible.

GraphPaper was an offshoot of [ScratchGraph](https://scratchgraph.com), and is one of its core dependencies.

GraphPaper is still very much a work-in-progress. Major, breaking, changes to the public API are not unsusual. However, releases are semantically versioned, so major releases are tagged appropriately and should not cause issues if consumed appropiately.

## Quick Start: Sheets & Entities

![graphpaper-connector](https://user-images.githubusercontent.com/12861733/33002147-358957a8-cd80-11e7-89ae-1b211c0eb2db.png)


### Create a Sheet

Everything GraphPaper deals with is encapsulated on a Sheet. A sheet is a surface where GraphPaper entities can be added and actions on those entities can be performed.

To create a Sheet, we'll first need a DOM element with some basic styling:

```html
<!DOCTYPE html>
<html>

    <head>
        <title>GraphPaper Demo</title>
        <script src="../dist/graphpaper.js" type="text/javascript"></script>
        <style type="text/css">
            * { margin:0; padding:0; font-family:LatoRegular; font-size:14px; font-weight:normal; box-sizing:border-box; }
            html, body { width:100%; height:100%; }
            body { background:#fff; }

            #sheet {
                border:0px solid #f00; 
                width:1000px; 
                height:1000px; 
                overflow:hidden; 
                position:relative; 
                transform-origin:0 0;
            }

        </style>
    </head>

    <body>
        <div id="sheet"></div>
    </body>

</html>
```

Now we can create the `GraphPaper.Sheet` object:

```javascript
const sheet = new GraphPaper.Sheet(
    document.getElementById('sheet'),                   // DOM element of the Sheet
    window                                              // parent window 
);
```

The sheet will be created with the default, 12x12, dotted grid (note that this is one instance where GraphPaper does take control of some styling here, as the grid requires dynamic generation of an SVG image).

The sheet will be created and rendered. Now we can add entities to the sheet.

### Create an entity

Entities are things which live on the sheet. GraphPaper can handle interactions with entities, taking responsibility for transformations, computing and rendering connectors between entities, selecting and transforming a set of entities, etc.

Let's create a simple entity that we can translate on the sheet. We'll update the page to add a `<div>` for the entity, another `<div>` that'll serve as a handle (the thing you click on and drag to move the entity) for translation, and some styles for both.

```html
<!DOCTYPE html>
<html>

    <head>
        <title>GraphPaper Demo</title>
        <script src="../dist/graphpaper.js" type="text/javascript"></script>
        <style type="text/css">
            * { margin:0; padding:0; font-family:LatoRegular; font-size:14px; font-weight:normal; box-sizing:border-box; }
            html, body { width:100%; height:100%; }
            body { background:#fff; }

            #sheet {
                border:0px solid #f00; 
                width:1000px; 
                height:1000px; 
                overflow:hidden; 
                position:relative; 
                transform-origin:0 0;
            }

            #entity1 { 
                display:flex; 
                align-items:center; 
                justify-content:center; 
                position:absolute; 
                width:52px; 
                height:52px; 
                background:#fff; 
                border:1px solid #0094ff; 
                border-radius:4px; 
            }

            #translateHandle { 
                cursor:move; 
                display:block; 
                width:12px; 
                height:12px; 
                background:#0094ff; 
                border-radius:12px; 
            }

        </style>
    </head>

    <body>
        <div id="sheet">
            <div id="entity1">
                <div id="translateHandle"></div>
            </div>
        </div>
    </body>
</html>
```

Now let's create the `GraphPaper.Entity` object (note that units for size and positioning are [CSS pixels](https://www.w3.org/TR/CSS2/syndata.html#length-units))
:

```javascript
const entity = new GraphPaper.Entity(
    'gp-entity-001',                                    // id
    0,                                                  // x        
    0,                                                  // y
    44,                                                 // width
    44,                                                 // height
    sheet,                                              // parent GraphPaper.Sheet
    document.getElementById('entity1'),                 // DOM element for the entity
    [document.getElementById('translateHandle')],       // DOM elements for the object's translation handles
    []                                                  // DOM elements for the object's resize handles
);
```

... and add this entity to our sheet:

```javascript
sheet.addEntity(entity);
```

The translate handle won't do anything yet. There's one final step, we need to tell the sheet that it should listen for and handle transformations, this is done via:

```javascript
sheet.initTransformationHandlers();
```

Now you can drag the entity around the canvas by dragging `translateHandle`, either via a mouse or touch interaction. The entity will automatically snap to the grid on the sheet.

## Documentation

- [Getting information about a sheet](docs/sheet-get-info.md)
- [Modifying a sheet's grid](docs/sheet-modify-grid.md)
- Working with entities on the sheet
- [Sheet Events](docs/sheet-events.md)
- Entity methods
- Connectors
- Group Entity Selection & Transformation


---


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


