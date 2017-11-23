# GraphPaper

[![CircleCI](https://circleci.com/gh/aautar/graphpaper.svg?style=svg)](https://circleci.com/gh/aautar/graphpaper)

GraphPaper helps with creating 2D, interactive, workspaces for web applications. It isn't an "out of the box" solution; GraphPaper takes over handling user interactions and transformations of objects, but markup and styling of those objects are left to the caller.

Very much a work-in-progress.

Used as the basis for sheets in [ScratchGraph](https://scratchgraph.com)

![graphpaper-connector](https://user-images.githubusercontent.com/12861733/33002147-358957a8-cd80-11e7-89ae-1b211c0eb2db.png)

## The Basics

Some basic CSS styling + DOM elements we'll use:

```css
* { margin:0; padding:0; font-family:LatoRegular; font-size:14px; font-weight:normal; }
html, body { width:100%; height:100%; }
body { background:#fff; }
ul, li { list-style:none; }
path { fill: none; }

#paper { border:2px solid #f00; width:1000px; height:1000px; overflow:hidden; position:relative; transform-origin:0 0; transition:transform 0.55s ease-in-out; }

.obj { display:flex; align-items:center; justify-content:center; position:absolute; width:44px; height:44px; background:#fff; border:1px solid #0094ff; border-radius:4px; }
.translateHandle { cursor:move; display:block; width:12px; height:12px; background:#0094ff; border-radius:12px; }
.resizeHandle { cursor:nwse-resize; display:block; position:absolute; bottom:3px; right:3px; width:12px; height:12px; background:url(resize-handle.svg) 0 0 no-repeat; } 
.connectorAnchor { cursor:pointer; display:block; position:absolute; top:0px; right:-18px; width:12px; height:12px; background:#fff; border:2px solid rgb(0, 109, 201); border-radius:4px; }
```

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
    document.getElementById('translateHandle1'),        // DOM element for the object's translation handle
    document.getElementById('resizeHandle1')            // DOM element for the object's resize handle
);
```

### Add the object to the canvas

```javascript
canvas.addObject(obj1);
```

 The object (`obj1`) will be added to the canvas and can now be translated by dragging the translation handle (`#translateHandle1`) or resized with the resize handle (`#resizeHandle1`). GraphPaper will take care of both mouse and touch interactions on the handle elements.
