# GraphPaper

[![CircleCI](https://circleci.com/gh/aautar/graphpaper.svg?style=svg)](https://circleci.com/gh/aautar/graphpaper)

GraphPaper helps with creating 2D, interactive, workspaces for web applications. It isn't an "out of the box" solution; GraphPaper takes over handling user interactions and transformations of objects, but markup and styling of those objects are left to the caller.

Very much a work-in-progress.

Used as the basis for sheets in [ScratchGraph](https://scratchgraph.com)

![graphpaper-connector](https://user-images.githubusercontent.com/12861733/33002147-358957a8-cd80-11e7-89ae-1b211c0eb2db.png)

## The Basics

Some basic DOM elements we'll use:
```html
<div id="paper">
    <div id="obj1" class="obj">
        <div id="translateHandle1" class="translateHandle"></div>
        <div id="resizeHandle1"  class="resizeHandle"></div>
        <div id="connectorAnchor1" class="connectorAnchor"></div>
    </div>
</div>
```

### Create a canvas

```javascript
const canvas = new GraphPaper.Canvas(
    document.getElementById('paper'),   // div to use
    function() { },                     // callback on interaction
    window                              // parent window 
);

canvas.initTransformationHandlers();
```

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
    document.getElementById('translateHandle1'),        // DOM element for the object's translation handle
    document.getElementById('resizeHandle1')            // DOM element for the object's resize handle
);
```

### Add the object to the canvas

```javascript
canvas.addObject(obj1);
```
