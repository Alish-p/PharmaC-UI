// ----------------------------------------------------------------------

export function paramCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// ----------------------------------------------------------------------

export function snakeCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// ----------------------------------------------------------------------

export function sentenceCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ----------------------------------------------------------------------

export function titleCase(string) {
  return string.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

// write function to wrap the text into few characters and wrap with three dots
export function wrapText(text, maxLength = 30) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
