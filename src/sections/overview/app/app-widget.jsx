import Box from '@mui/material/Box';

import { fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function AppWidget({ title, total, icon, sx, ...other }) {
  return (
    <Box
      sx={{
        p: 3,
        gap: 3,
        borderRadius: 2,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        color: 'common.white',
        bgcolor: 'primary.dark',
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 200,
            height: 200,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>

      <div>
        <Box sx={{ typography: 'h4' }}>{fShortenNumber(total)} </Box>
        <Box sx={{ typography: 'subtitle2', opacity: 0.64 }}>{title}</Box>
      </div>

      <Iconify
        icon={icon}
        sx={{
          width: 120,
          right: -40,
          height: 120,
          opacity: 0.08,
          position: 'absolute',
        }}
      />
    </Box>
  );
}
