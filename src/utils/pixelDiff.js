import colorStringToRgbArray from './color';

const normalizeGrid = (grid, totalCells) => {
  const normalized = new Array(totalCells).fill('');

  if (!Array.isArray(grid)) {
    return normalized;
  }

  for (let index = 0; index < totalCells; index += 1) {
    const value = grid[index];
    normalized[index] = typeof value === 'string' ? value : value || '';
  }

  return normalized;
};

const diffFramePixels = ({ previousGrid, nextGrid, columns, rows }) => {
  const totalCells = columns * rows;
  const previous = normalizeGrid(previousGrid, totalCells);
  const next = normalizeGrid(nextGrid, totalCells);

  const xs = [];
  const ys = [];
  const colors = [];

  for (let index = 0; index < totalCells; index += 1) {
    const initialColor = previous[index] || '';
    const nextColor = next[index] || '';

    if (initialColor !== nextColor) {
      xs.push(index % columns);
      ys.push(Math.floor(index / columns));
      colors.push(colorStringToRgbArray(nextColor));
    }
  }

  return {
    xs,
    ys,
    colors
  };
};

export default diffFramePixels;
