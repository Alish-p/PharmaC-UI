// Utility to compute logo URL with cache-busting and sane fallbacks
import CORE_COLORS from 'src/theme/core/colors.json';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';

// Returns a logo URL for the given tenant with optional cache-busting.
// - Prefers tenant.logoUrl if available.
// - If not set, and `fallback` is true (default), returns a data-URL SVG
//   avatar showing the first letter of the tenant name.
// - Adds `?v=<timestamp>` based on logoUpdatedAt or updatedAt if present.
export function getTenantLogoUrl(tenant, { size, fallback = true } = {}) {
  if (!tenant) return '';
  const { logoUrl, logoUpdatedAt, updatedAt, name } = tenant;

  if (logoUrl) {
    const version = logoUpdatedAt || updatedAt;
    const url = version
      ? `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${new Date(version).getTime()}`
      : logoUrl;
    // Optionally support basic transform hints via size, if CDN supports it (no-op otherwise)
    return url;
  }

  if (!fallback) return '';

  // Generate a simple SVG avatar with first letter of name
  const s = typeof size === 'number' ? Math.max(16, size) : 60;
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  const bg = '#E5E7EB'; // neutral background
  // Pick foreground from tenant's primary theme color if available
  const themeKey = String(tenant?.theme || 'default').toLowerCase();
  const defaultMain = CORE_COLORS?.primary?.main || '#1c62d4ff';
  const themed = themeKey === 'default' ? defaultMain : PRIMARY_COLOR?.[themeKey]?.main;
  const fg = themed || defaultMain;
  const fontSize = Math.floor(s * 0.5);
  const radius = Math.floor(s / 2);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${radius}" ry="${radius}" fill="${bg}" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-weight="700" font-size="${fontSize}" fill="${fg}">${initial}</text>
  </svg>`;

  const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return dataUrl;
}
