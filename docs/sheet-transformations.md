# Sheet Transformations

GraphPaper allows for scaling and translation to be applied to a Sheet. Visually, this is done via [CSS with a 4x4 transformation matrix](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d()), but the Sheet also maintains this matrix (and it's inverse) to allow for interactions to function correctly within the transformed space (i.e. dragging an Entity will work the same way at 50% scale as it does at 100% scale). As such, CSS transformations should only be applied via `Sheet` methods and not directly to the underlying DOM element by consumers.

With GraphPaper, you setup the transformations you want via the various transformation methods, then call `Sheet.applyTransform()` to apply the transformation you've setup.

### Scale the sheet
A Sheet can be scaled via the `Sheet.scale()` method. The method takes 2 arguments, `_scaleFactor` (required) and `_adjustFactorToPreserveIntegerGrid` (optional, default: `false`). 

- The first, `_scaleFactor` is a `Number` in the range [0, 1] indicating the scale factor. 

- The second, `_adjustFactorToPreserveIntegerGrid` is to allow the method to adjust the scale factor such that the grid lines are at integer positions. This is helpful when having Entities positioned at non-integer locations or having non-integer dimensions is undesirable.

```javascript
const sheet = sheet.scale(0.5, true);
```

The method returns the Sheet object to allow for chaining transformation calls.

### Get the current scaling factor
The current scaling factor can be retrieved via the `Sheet.getScaleFactor()` method. The method will return a `Number` in the range [0, 1].

```javascript
const sF = sheet.getScaleFactor();
```

Note that the scaling factor returned is not necessarily the *applied* scaling factor. e.g. If `Sheet.scale()` is called, this method is return the computed scaling factor from the call, it does not matter that `Sheet.applyTransform()` has not been called.

### Translate the sheet
A Sheet can be translated via the `Sheet.translate()` method. The method takes 2 arguments, `_x` (required) and `_y` (required).

- `_x` is a `Number` for the x (left) position of the Sheet
- `_y` is a `Number` for the y (top) position of the Sheet

```javascript
const sheet = sheet.translate(100, 100);
```

The method returns the Sheet object to allow for chaining transformation calls.

### Get the current translation
The current translation of the sheet can be retrieved via the `Sheet.getTranslateX()` and `Sheet.getTranslateY()` method. Both methods return a `Number`.

```javascript
const tx = sheet.getTranslateX();
const ty = sheet.getTranslateY();
```

Not that this is current translations which is not necessarily the *applied* translation.

### Modify the transformation origin
The default transformation origin is (0, 0), the top-left edge of the Sheet. The transformation origin can be changed via the `Sheet.setTransformOrigin()` method. The method takes 2 arguments, `_x` (required) and `_y` (required).

- `_x` is a `Number` for the x coordinate of the transformation origin
- `_y` is a `Number` for the y coordinate of the transformation origin

```javascript
sheet.setTransformOrigin(100, 100);
```

This call corresponds to the CSS [transform-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) property.

### Get the current transformation origin
The current transformation origin can be retrieved via the `Sheet.getTransformOriginX()` and `Sheet.getTransformOriginY` methods. Both methods return a `Number`.

```javascript
const tx = sheet.getTransformOriginX();
const ty = sheet.getTransformOriginY();
```

### Applying transformations
Transformations are applied to the Sheet via the `Sheet.applyTransform()` method.

```javascript
sheet.applyTransform();
```
