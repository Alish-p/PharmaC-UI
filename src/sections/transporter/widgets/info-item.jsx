import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function InfoItem({ label, value, width = 140 }) {
  const isString = typeof value === 'string' || typeof value === 'number';

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ typography: 'body2' }}>
      <Box component="span" sx={{ color: 'text.secondary', width, flexShrink: 0 }}>
        {label}
      </Box>
      {isString ? <Typography>{value || '-'}</Typography> : (value ?? <Typography>-</Typography>)}
    </Stack>
  );
}

export default InfoItem;
