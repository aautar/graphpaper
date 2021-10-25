# Methods to get sheet info

## sheet.getWidth()
Get the width of a sheet

##### Syntax

```javascript
const width = sheet.getWidth();
```

##### Return Value
Returns a `Number` with the width of the Sheet

## sheet.getHeight()
Get the width of a sheet

##### Syntax

```javascript
const height = sheet.getHeight();
```

##### Return Value
Returns a `Number` with the height of the Sheet


## sheet.calcBoundingBox()
Calculate the the "active" area of a sheet

##### Syntax

```javascript
const rect = sheet.calcBoundingBox();
```

##### Return Value
Return a `Graphpaper.Rectangle` representing the "active" area of a sheet. The rectange will be a [bounding box](https://en.wikipedia.org/wiki/Minimum_bounding_box) of the region containing entities on the sheet. If there are no entities on the sheet, the rectangle will represent the entire sheet.

## sheet.getSheetOffset()
Get the offset of the Sheet's DOM element, relative to it's parent. Note that this method will calculate the offset unless DOM metrics have been locked, in which case the cached values will be returned.

##### Syntax
```javascript
const offsetPoint = sheet.getSheetOffset();
```

##### Return Value
Returns a `GraphPaper.Point` with the left (x), top (y) offset.
