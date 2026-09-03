import { memo } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

export const VehicleFolderCard = memo(({ vehicle, onOpen }) => (
  <Paper
    variant="outlined"
    onClick={() => onOpen(vehicle)}
    sx={(theme) => ({
      gap: 1,
      p: 2.5,
      maxWidth: 222,
      display: 'flex',
      borderRadius: 2,
      cursor: 'pointer',
      position: 'relative',
      bgcolor: 'transparent',
      flexDirection: 'column',
      alignItems: 'flex-start',
      boxShadow: 'none',
      transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        bgcolor: 'background.paper',
        boxShadow: theme.customShadows.z20,
      },
    })}
  >
    <Box sx={{ width: 36, height: 36 }}>
      <Box
        component="img"
        src={`${CONFIG.site.basePath}/assets/icons/files/ic-folder.svg`}
        sx={{ width: 1, height: 1 }}
      />
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle1" noWrap>
        {vehicle?.vehicleNo || 'Vehicle'}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {vehicle?.vehicleType || '-'}
      </Typography>
    </Box>
  </Paper>
));
