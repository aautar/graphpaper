# GraphPaper

GraphPaper helps with creating 2D, interactive, workspaces for web applications. It isn't an "out of the box" solution; GraphPaper handles transformations and interactions of objects, markup and styling of those objects are left to the caller.

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
    document.getElementById('paper'), 
    function() { },
    window
);

canvas.initTransformationHandlers();
```

###  Create an object

```javascript
const obj1 = new GraphPaper.CanvasObject(
    'obj1', 
    0, 
    0, 
    44, 
    44, 
    canvas,
    document.getElementById('obj1'), 
    document.getElementById('translateHandle1'),
    document.getElementById('resizeHandle1')
);
```

### Add the object to the canvas

```javascript
canvas.addObject(obj1);
```
