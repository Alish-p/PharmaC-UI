import L from 'leaflet';

/**
 * Creates a circular div-icon with a centered label.
 * @param {string} color  – CSS background colour
 * @param {string} label  – Short text rendered inside the circle (e.g. "A")
 * @param {number} [size] – Pixel diameter (default 28)
 */
export function createCircleIcon(color, label, size = 28) {
  const half = size / 2;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 2)],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${Math.round(size * 0.46)}px;
      font-family:Inter,system-ui,sans-serif;
    ">${label}</div>`,
  });
}
