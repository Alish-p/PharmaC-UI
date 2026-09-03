import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../../iconify';
import { FileThumbnail } from '../../file-thumbnail';

// ----------------------------------------------------------------------

export function SingleFilePreview({ file }) {
  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    >
      <FileThumbnail
        file={file}
        imageView
        sx={{ width: 1, height: 1, borderRadius: 1 }}
        slotProps={{
          img: { width: '100%', height: '100%', objectFit: 'cover' },
          icon: { width: 64, height: 64 },
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function DeleteButton({ sx, ...other }) {
  return (
    <IconButton
      size="small"
      sx={{
        top: 16,
        right: 16,
        zIndex: 9,
        position: 'absolute',
        color: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
        '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
        ...sx,
      }}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}
