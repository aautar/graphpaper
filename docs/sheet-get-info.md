# Get information about a sheet

# Get dimensions

### Get the width of a sheet

```javascript
sheet.getWidth();
```

### Get the height of a sheet

```javascript
sheet.getHeight();
```

### Get sheet bounding box

```javascript
sheet.calcBoundingBox();
```

This methods will return a `Graphpaper.Rectangle` representing the "active" area of a sheet. The rectange will be [bounding box](https://en.wikipedia.org/wiki/Minimum_bounding_box) of the region containing entities on the sheet. If there are no entities on the sheet, the rectangle will represent the entire sheet.
