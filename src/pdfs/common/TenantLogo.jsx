/* eslint-disable react/prop-types */
import { Svg, View, Text, Rect, Image } from '@react-pdf/renderer';

import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import CORE_COLORS from 'src/theme/core/colors.json';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';

function isSvgSrc(src) {
  if (!src || typeof src !== 'string') return false;
  const lower = src.toLowerCase();
  return lower.startsWith('data:image/svg+xml') || /\.svg(\?.*)?$/.test(lower);
}

function isRasterSupported(src) {
  if (!src || typeof src !== 'string') return false;
  const lower = src.toLowerCase();
  // Data URLs
  if (lower.startsWith('data:image/')) {
    // Supported: jpg, jpeg, png, gif, bmp
    return (
      lower.startsWith('data:image/png') ||
      lower.startsWith('data:image/jpg') ||
      lower.startsWith('data:image/jpeg') ||
      lower.startsWith('data:image/gif') ||
      lower.startsWith('data:image/bmp')
    );
  }

  // File extensions (ignore query params)
  return /(\.png|\.jpe?g|\.gif|\.bmp)(\?.*)?$/.test(lower);
}

function getPrimaryMainColor(tenant) {
  const themeKey = String(tenant?.theme || 'default').toLowerCase();
  const defaultMain = CORE_COLORS?.primary?.main || '#1c62d4ff';
  const themed = themeKey === 'default' ? defaultMain : PRIMARY_COLOR?.[themeKey]?.main;
  return themed || defaultMain;
}

export default function TenantLogo({ tenant, size = 55, src }) {
  // Prefer an explicit src prop, otherwise derive a cache-busted logo URL without SVG fallback
  const resolvedSrc = src || getTenantLogoUrl(tenant, { fallback: false });

  if (resolvedSrc && isRasterSupported(resolvedSrc) && !isSvgSrc(resolvedSrc)) {
    return <Image src={resolvedSrc} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }

  // PDF-safe fallback: vector avatar with initial
  const bg = '#E5E7EB';
  const fg = getPrimaryMainColor(tenant);
  const fontSize = Math.floor(size * 0.5);
  const radius = Math.floor(size / 2);
  const initial =
    (tenant?.name || tenant?.company?.name || '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} rx={radius} ry={radius} fill={bg} />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 5,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: fg, fontSize, fontWeight: 700 }}>{initial}</Text>
      </View>
    </View>
  );
}
