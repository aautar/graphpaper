import {GRID_STYLE,Grid} from '../src/Grid'

describe("Grid.getSize", function() { 
  it("returns size of grid", function() {
    const grid = new Grid(12.0, '#000', GRID_STYLE.DOT);
    expect(grid.getSize()).toBe(12.0);
  });  
});

describe("Grid.getSvgImageTile", function() { 
    it("returns correct SVG markup for dot grid style", function() {
      const grid = new Grid(12.0, '#000', GRID_STYLE.DOT);
      expect(grid.getSvgImageTile()).toBe('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="1" height="1" x="11" y="11" style="fill:#000" /></svg>');
    });

    it("returns correct SVG markup for line grid style", function() {
        const grid = new Grid(12.0, '#000', GRID_STYLE.LINE);
        expect(grid.getSvgImageTile()).toBe('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="1" x="0" y="11" style="fill:#000" /><rect width="1" height="12" x="11" y="0" style="fill:#000" /></svg>');
      });
  });
  