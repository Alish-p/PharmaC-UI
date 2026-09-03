import { Card, Typography } from '@mui/material';
// @mui
import { alpha, useTheme } from '@mui/material/styles';

// utils
import { fShortenNumber } from 'src/utils/format-number';

import { bgGradient } from 'src/theme/styles';

// components
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AnalyticsWidgetSummary({
  title,
  total,
  subtext,
  icon,
  color = 'primary',
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        py: 3,
        boxShadow: 0,
        textAlign: 'center',
        color: theme.palette[color].darker,
        bgcolor: theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <Iconify
        icon={icon}
        sx={{
          mb: 1,
          p: 2.5,
          width: 64,
          height: 64,
          borderRadius: '50%',
          color: theme.palette[color].dark,
          ...bgGradient({
            direction: '135deg',
            startColor: `${alpha(theme.palette[color].dark, 0)} 0%`,
            endColor: `${alpha(theme.palette[color].dark, 0.24)} 100%`,
          }),
        }}
      />

      <Typography variant="h3">{typeof total === 'number' ? fShortenNumber(total) : ''}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
        {title}
      </Typography>

      {subtext ? (
        <Typography variant="body2" sx={{ opacity: 0.56 }}>
          {subtext}
        </Typography>
      ) : null}
    </Card>
  );
}
