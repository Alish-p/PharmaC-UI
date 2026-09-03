import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function OverviewWidget({
  title,
  total,
  icon,
  color = 'primary',
  unit,
  sx,
  subtitle,
  subtitleColor = 'text.disabled',
  infoTooltip,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2">{title}</Typography>
          {infoTooltip && (
            <Tooltip
              title={infoTooltip}
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: theme.customShadows?.dropdown || theme.shadows[8],
                    p: 1.5,
                    borderRadius: 1,
                  },
                },
                arrow: {
                  sx: {
                    color: 'background.paper',
                  },
                },
              }}
            >
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h3">{total}</Typography>
          {unit && (
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', alignSelf: 'flex-end', mb: 1 }}
            >
              {unit}
            </Typography>
          )}
        </Stack>
        {subtitle && (
          <Typography variant="caption" sx={{ color: subtitleColor, display: 'block', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: 120,
          height: 120,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[color].main, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={64} sx={{ color: theme.palette[color].main }} />
      </Box>
    </Card>
  );
}
