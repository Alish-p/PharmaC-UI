import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { RouterLink } from 'src/routes/components';

import { bgGradient } from 'src/theme/styles';

import { Iconify } from '../iconify';
import { ActionMenuBar } from './action-menu-bar';

export function HeroHeaderCard({
  icon,
  title,
  status,
  meta = [],
  action,
  actions,
  menus,
  gradient,
  sx,
  ...other
}) {
  const theme = useTheme();

  const background =
    gradient || `100deg, ${theme.vars.palette.primary.main}, ${theme.vars.palette.primary.lighter}`;

  return (
    <Card
      sx={{
        ...bgGradient({ color: background }),
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
      {...other}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        {/* Top row: title + right-aligned actions (including hamburger on mobile) */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              {icon && <Iconify icon={icon} width={32} height={32} />}
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {status && (
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'common.white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {action ? (
              <Box sx={{ flexShrink: 0 }}>{action}</Box>
            ) : menus || actions ? (
              <Box sx={{ flexShrink: 0 }}>
                <ActionMenuBar menus={menus} actions={actions} />
              </Box>
            ) : null}
          </Stack>

          {/* Meta row below title */}
          {!!meta.length && (
            <Stack direction="row" spacing={3} sx={{ mt: 0.5 }} flexWrap="wrap">
              {meta.map((item) => (
                <Stack key={item.label} direction="row" spacing={1} alignItems="center">
                  {item.icon && <Iconify icon={item.icon} width={16} height={16} />}
                  {item.href ? (
                    <Link
                      component={RouterLink}
                      href={item.href}
                      variant="body2"
                      color="white"
                      sx={{ opacity: 0.9 }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {item.label}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default HeroHeaderCard;
