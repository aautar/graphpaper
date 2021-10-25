# Sheet Transformations

GraphPaper allows for scaling and translation to be applied to a Sheet. Visually, this is done via [CSS with a 4x4 transformation matrix](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d()), but the Sheet also maintains this matrix (and it's inverse) to allow for interactions to function correctly within the transformed space (i.e. dragging an Entity will work the same way at 50% scale as it does at 100% scale). As such, CSS transformations should only be applied via `Sheet` methods and not directly to the underlying DOM element by consumers.

With GraphPaper, you setup the transformations you want via the various transformation methods, then call `Sheet.applyTransform()` to apply the transformation you've setup.

#### Scale
A Sheet can be scaled via the `Sheet.scale()` method.

```javascript
const sheet = sheet.scale(0.5, true);
```

##### Parameters
- `_scaleFactor` (required): A `Number` in the range [0, 1] indicating the scaling factor
- `_adjustFactorToPreserveIntegerGrid` (optional, default: `false`): Scaling may result in the grid being scaled such that grid lines are at non-integer position and, as such, entities are snapped to non-integer positions. If this behavior is undesirable, setting this parameter to `true` will adjust the scale factor to a value near `_scaleFactor`, such that grid lines are at integer values.

##### Return Value
The method returns the Sheet object to allow for chaining transformation calls.

#### Translate
A Sheet can be translated via the `Sheet.translate()` method.

```javascript
const sheet = sheet.translate(100, 100);
```
##### Parameters
- `_x` (required): A `Number` for the x (left) position of the Sheet
- `_y` (required): A `Number` for the x (left) position of the Sheet

##### Return Value
The method returns the Sheet object to allow for chaining transformation calls.


#### Applying
Transformations are applied to the Sheet via the `Sheet.applyTransform()` method.

```javascript
sheet.applyTransform();
```
