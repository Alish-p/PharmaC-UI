import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function DashboardTotalWidget({
  icon,
  title,
  total,
  color = 'primary',
  onTotalClick,
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        ...bgGradient({
          color: `135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)}`,
        }),
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ width: 36, height: 36 }}>{icon}</Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2', minHeight: 40 }}>{title}</Box>
          <Box
            onClick={onTotalClick}
            sx={{
              typography: 'h4',
              ...(onTotalClick && {
                cursor: 'pointer',
                display: 'inline-block',
                borderBottom: `2px solid currentColor`,
                lineHeight: 1.2,
                pb: '2px',
                transition: 'opacity 0.15s',
                '&:hover': { opacity: 0.65 },
              }),
            }}
          >
            {fShortenNumber(total)}
          </Box>
        </Box>
      </Box>

      <SvgColor
        src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}
