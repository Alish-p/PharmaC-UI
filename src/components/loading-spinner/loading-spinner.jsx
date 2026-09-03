import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingSpinner({ sx, ...other }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, ...sx }} {...other}>
      <CircularProgress size={24} />
    </Box>
  );
}
