import shortid from 'shortid';
import { rgbArrayToCanvasColor } from './color';

const DEFAULT_COLUMNS = 20;
const DEFAULT_ROWS = 20;
const DEFAULT_CELL_SIZE = 10;
const DEFAULT_INTERVAL = 100;

const normalizeProject = baseProject => {
  if (!baseProject) {
    return {};
  }

  return baseProject;
};

const createEmptyGrid = (columns, rows) => new Array(columns * rows).fill('');

const resolveDimensions = ({ baseColumns, baseRows, xValues, yValues }) => {
  const maxX = xValues.reduce(
    (acc, value) => Math.max(acc, Number(value) || 0),
    0
  );
  const maxY = yValues.reduce(
    (acc, value) => Math.max(acc, Number(value) || 0),
    0
  );

  const columns = Math.max(baseColumns, maxX + 1);
  const rows = Math.max(baseRows, maxY + 1);
  return { columns, rows };
};

const normalizeColorArray = colorValue => {
  if (!Array.isArray(colorValue)) {
    return [];
  }

  return colorValue.slice(0, 3).map(component => Number(component) || 0);
};

const applyPixelsToGrid = ({
  baseGrid,
  columns,
  xValues,
  yValues,
  colorValues
}) => {
  const grid = baseGrid.slice();

  for (let index = 0; index < xValues.length; index += 1) {
    const column = Number(xValues[index]);
    const row = Number(yValues[index]);

    const invalidCoordinate =
      Number.isNaN(column) || Number.isNaN(row) || column < 0 || row < 0;

    if (!invalidCoordinate) {
      const cellPosition = row * columns + column;
      const withinBounds = cellPosition >= 0 && cellPosition < grid.length;

      if (withinBounds) {
        const rgbColor = normalizeColorArray(colorValues[index]);
        grid[cellPosition] = rgbArrayToCanvasColor(rgbColor);
      }
    }
  }

  return grid;
};

const buildProjectFromPixels = (pixels, baseProject = null) => {
  const normalizedProject = normalizeProject(baseProject);
  const baseColumns = normalizedProject.columns || DEFAULT_COLUMNS;
  const baseRows = normalizedProject.rows || DEFAULT_ROWS;
  const baseCellSize = normalizedProject.cellSize || DEFAULT_CELL_SIZE;
  const basePalette =
    normalizedProject.paletteGridData &&
    normalizedProject.paletteGridData.length > 0
      ? normalizedProject.paletteGridData
      : [];

  const xValues = pixels?.x || [];
  const yValues = pixels?.y || [];
  const colorValues = pixels?.colors || [];

  if (xValues.length !== yValues.length) {
    return null;
  }

  const { columns, rows } = resolveDimensions({
    baseColumns,
    baseRows,
    xValues,
    yValues
  });

  const emptyGrid = createEmptyGrid(columns, rows);
  const grid = applyPixelsToGrid({
    baseGrid: emptyGrid,
    columns,
    xValues,
    yValues,
    colorValues
  });

  const frame = {
    grid,
    interval:
      normalizedProject.frames && normalizedProject.frames[0]
        ? normalizedProject.frames[0].interval || DEFAULT_INTERVAL
        : DEFAULT_INTERVAL,
    key:
      normalizedProject.frames && normalizedProject.frames[0]
        ? normalizedProject.frames[0].key || shortid.generate()
        : shortid.generate()
  };

  return {
    frames: [frame],
    paletteGridData: basePalette,
    cellSize: baseCellSize,
    columns,
    rows,
    animate: false,
    id: normalizedProject.id || shortid.generate()
  };
};

export default buildProjectFromPixels;
