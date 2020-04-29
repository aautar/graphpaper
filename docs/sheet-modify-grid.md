# Modifying a sheet's grid

The grid rendered on a Sheet, along with the "snap to grid" behavior a Sheet will impart on entities, is set via the properties of a `Grid` object assigned to the Canvas.

A Grid is assigned/changed on a Sheet via the `Sheet.setGrid(_newGrid)` method.

A new Grid object is created as follows:
 
 `new Grid(12.0, '#424242', GRID_STYLE.DOT)`
(this is the default grid created and assigned to a Canvas upon construction)

The `Grid` constructor takes 3 parameters: the size of the grid, the color of the grid, and the style of the grid (GRID_STYLE.DOT or GRID_STYLE.LINE)
