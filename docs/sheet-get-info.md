# Get information about a sheet

### Dimensions
The dimensions of a sheet can be queries with the `Sheet.getWidth()` and `Sheet.getHeight()` methods.

```javascript
const width = sheet.getWidth();
const height = sheet.getHeight();
```

Both methods return a `Number`.

### Bounding box
A bounding box representing the "active" area of the Sheet, i.e. the area containing Entities, can be retrieved with the `Sheet.calcBoundingBox()` method.

```javascript
const boundingBox = sheet.calcBoundingBox();
```

This method will return a `Graphpaper.Rectangle` representing the "active" area of a sheet. The rectange will be a [bounding box](https://en.wikipedia.org/wiki/Minimum_bounding_box) of the region containing entities on the sheet. If there are no entities on the sheet, the rectangle will represent the entire sheet.

### Offset
The offset of the Sheet, specifically the Sheet's DOM Element relative to its parent Element, can be retrieved with the `Sheet.getSheetOffset()` method.

```javascript
const offsetPoint = sheet.getSheetOffset();
```

This method will return a `GraphPaper.Point` with the offset. If DOM metrics have been locked, the cached values will be returned, if not the offsets will be calculated and returned.

### Transformations
See [Sheet Transformations](sheet-transformations.md).
