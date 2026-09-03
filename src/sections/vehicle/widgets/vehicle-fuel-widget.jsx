import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function VehicleFuelWidget({ value = 0, total = 400, sx, ...other }) {
  const percent = Math.min(100, (value / total) * 100);

  return (
    <Card sx={{ p: 2, position: 'relative', ...sx }} {...other}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Iconify
          icon="solar:gas-station-bold"
          width={24}
          height={24}
          color="success.main"
          sx={{ mr: 2 }}
        />{' '}
        Fuel
      </Typography>

      <LinearProgress
        variant="determinate"
        value={percent}
        color="inherit"
        sx={{ my: 1, height: 6, '&::before': { bgcolor: 'divider', opacity: 1 } }}
      />

      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="flex-end"
        sx={{ typography: 'subtitle2' }}
      >
        <Box sx={{ mr: 0.5, typography: 'body2', color: 'text.disabled' }}>{fNumber(value)}L</Box>
        {` / ${fNumber(total)} L`}
      </Stack>
    </Card>
  );
}
