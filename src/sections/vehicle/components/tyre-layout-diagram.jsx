import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function TyreLayoutDiagram({
  positions = [],
  selectedPosition,
  onSelect,
  sx,
  tyreMap = {},
}) {
  const theme = useTheme();

  // Group positions by axle/row
  const getRow = (pos) => {
    if (pos.includes('Axle-1')) return 0;
    if (pos.includes('Axle-2')) return 1;
    if (pos.includes('Axle-3')) return 2;
    if (pos.includes('Axle-4')) return 3;
    if (pos.includes('Axle-5')) return 4;
    return 10; // Other (Stepney)
  };

  // Filter out Stepney for main chassis diagram, show distinct for Stepney
  const chassisPositions = positions.filter((p) => !p.includes('Stepney'));
  const stepneyPositions = positions.filter((p) => p.includes('Stepney'));

  // Group by row index
  const rows = {};
  chassisPositions.forEach((p) => {
    const r = getRow(p);
    if (!rows[r]) rows[r] = [];
    rows[r].push(p);
  });

  const sortedRowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  const renderTyre = (pos, isHorizontal = false) => {
    const isPresent = !!pos;

    if (!isPresent) {
      return (
        <Box
          sx={{
            width: isHorizontal ? 48 : 24,
            height: isHorizontal ? 24 : 48,
            visibility: 'hidden',
          }}
        />
      );
    }

    const isSelected = isPresent && selectedPosition === pos;
    const mountedTyre = isPresent ? tyreMap[pos] : null;

    const content = (
      <Box
        onClick={() => isPresent && onSelect && onSelect(pos)}
        sx={{
          width: isHorizontal ? 48 : 24,
          height: isHorizontal ? 24 : 48,
          borderRadius: 1,
          border: `2px solid ${theme.palette.text.secondary}`,
          bgcolor: isSelected
            ? 'primary.main'
            : mountedTyre
              ? theme.palette.success.main
              : isPresent
                ? theme.palette.text.secondary
                : 'transparent',
          opacity: isPresent ? 1 : 0.2,
          ...(isSelected && {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 4px ${theme.palette.primary.lighter}`,
          }),
          ...(isPresent &&
            onSelect && {
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }),
        }}
      />
    );

    if (mountedTyre) {
      return (
        <Tooltip
          title={
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2">{mountedTyre.brand}</Typography>
              <Typography variant="caption">{mountedTyre.serialNumber}</Typography>
            </Box>
          }
          arrow
        >
          {content}
        </Tooltip>
      );
    }

    return content;
  };

  const renderRow = (rowIndex) => {
    const rowPositions = rows[rowIndex] || [];

    // Rear Axles (Dual tyres: Outer, Inner | Inner, Outer)
    const leftOuter = rowPositions.find((p) => p.includes('Left') && p.includes('Outer'));
    const leftInner = rowPositions.find((p) => p.includes('Left') && p.includes('Inner'));
    const rightInner = rowPositions.find((p) => p.includes('Right') && p.includes('Inner'));
    const rightOuter = rowPositions.find((p) => p.includes('Right') && p.includes('Outer'));

    // Chassis width is visually around 100px.
    // We want Inner tyres INSIDE the chassis, Outer tyres OUTSIDE.
    // Stack spacing:
    // [Outer] <2px> [Inner] <gap> [Inner] <2px> [Outer]

    return (
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" key={rowIndex}>
        <Stack direction="row" spacing={1}>
          {renderTyre(leftOuter)}
          {renderTyre(leftInner)}
        </Stack>

        {/* Space between Left Inner and Right Inner (needs to fit inside chassis) */}
        <Box sx={{ width: 76 }} />

        <Stack direction="row" spacing={1}>
          {renderTyre(rightInner)}
          {renderTyre(rightOuter)}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack spacing={1} alignItems="center" sx={{ py: 3, ...sx }}>
      <Box sx={{ position: 'relative', px: 6, py: 2 }}>
        {/* Chassis Body */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 150, // Fixed width for chassis
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            // Front indicator
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 12,
              bgcolor: theme.palette.text.disabled,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            },
          }}
        />

        {/* Tyres Layer */}
        <Stack spacing={4} sx={{ position: 'relative', zIndex: 1, pt: 4 }}>
          {sortedRowKeys.map((k) => renderRow(Number(k)))}
        </Stack>
      </Box>

      {/* Stepney Section */}
      {stepneyPositions.length > 0 && (
        <Stack direction="row" spacing={2} alignItems="center">
          {stepneyPositions.map((p) => (
            <Box key={p}>{renderTyre(p, true)}</Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
