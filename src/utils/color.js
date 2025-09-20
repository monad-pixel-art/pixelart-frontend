const HEX_SHORT_LENGTH = 3;

const expandHex = hexValue =>
  hexValue
    .split('')
    .map(char => `${char}${char}`)
    .join('');

const parseHex = color => {
  const hex = color.slice(1);
  const normalizedHex =
    hex.length === HEX_SHORT_LENGTH ? expandHex(hex) : hex.toLowerCase();

  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return [red, green, blue];
};

const parseRgbString = color => {
  const match = color.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return [0, 0, 0];
  }

  const parts = match[1]
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  const red = parseInt(parts[0], 10) || 0;
  const green = parseInt(parts[1], 10) || 0;
  const blue = parseInt(parts[2], 10) || 0;

  return [red, green, blue];
};

const isHexColor = color => /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);

const colorStringToRgbArray = colorValue => {
  if (!colorValue) {
    return [0, 0, 0];
  }

  const color = colorValue.trim();

  if (isHexColor(color)) {
    return parseHex(color);
  }

  if (/^rgba?/i.test(color)) {
    return parseRgbString(color);
  }

  if (color.toLowerCase() === 'transparent') {
    return [0, 0, 0];
  }

  return [0, 0, 0];
};

export default colorStringToRgbArray;
