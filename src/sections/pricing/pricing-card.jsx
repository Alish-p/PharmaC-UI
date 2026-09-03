import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { varAlpha, stylesMode } from 'src/theme/styles';
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PricingCard({ card, sx, ...other }) {
  const { subscription, price, caption, lists } = card;

  const basic = subscription === 'basic';

  const standard = subscription === 'standard';

  const premium = subscription === 'premium';

  const renderIcon = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {basic && <PlanFreeIcon sx={{ width: 64 }} />}
      {standard && <PlanStarterIcon sx={{ width: 64 }} />}
      {premium && <PlanPremiumIcon sx={{ width: 64 }} />}

      {standard && <Label color="info">POPULAR</Label>}
      {premium && <Label color="success">BEST VALUE</Label>}
    </Stack>
  );

  const renderSubscription = (
    <Stack spacing={1}>
      <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
        {subscription}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {caption}
      </Typography>
    </Stack>
  );

  const renderPrice = (
    <Stack direction="row" alignItems="baseline">
      <Typography variant="h3">₹{price}</Typography>

      <Typography
        component="span"
        sx={{
          color: 'text.disabled',
          ml: 1,
          typography: 'body2',
        }}
      >
        / vehicle / month
      </Typography>
    </Stack>
  );

  const renderList = (
    <Stack spacing={2}>
      <Box component="span" sx={{ typography: 'overline' }}>
        Features
      </Box>

      {lists.map((item) => (
        <Stack
          key={item.text}
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{
            typography: 'body2',
            ...(!item.enabled && { color: 'text.disabled' }),
          }}
        >
          <Iconify
            icon={item.enabled ? 'eva:checkmark-fill' : 'mingcute:close-line'}
            width={16}
            sx={{
              mr: 1,
              color: item.enabled ? 'success.main' : 'text.disabled',
            }}
          />
          {item.text}
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Stack
      spacing={5}
      sx={{
        p: 5,
        borderRadius: 2,
        bgcolor: 'background.default',
        boxShadow: (theme) => ({ xs: theme.customShadows.card, md: 'none' }),
        ...((basic || standard) && {
          borderTopRightRadius: { md: 0 },
          borderBottomRightRadius: { md: 0 },
        }),
        ...((standard || premium) && {
          boxShadow: (theme) => ({
            xs: theme.customShadows.card,
            md: `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          }),
          [stylesMode.dark]: {
            boxShadow: (theme) => ({
              xs: theme.customShadows.card,
              md: `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.common.blackChannel, 0.16)}`,
            }),
          },
        }),
        ...sx,
      }}
      {...other}
    >
      {renderIcon}

      {renderSubscription}

      {renderPrice}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderList}
    </Stack>
  );
}
