import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

export function TenantSubscriptionWidget({ subscription, sx, action, ...other }) {
  const planName = subscription?.planName || subscription?.plan || '—';
  const validTill = subscription?.validTill ? fDate(subscription.validTill) : '—';
  const isActive = subscription?.isActive ?? null;

  return (
    <Card sx={{ p: 2.5, ...sx }} {...other}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Subscription</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {isActive != null && (
            <Chip
              size="small"
              color={isActive ? 'success' : 'default'}
              label={isActive ? 'Active' : 'Inactive'}
            />
          )}
          {action}
        </Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        <Row label="Plan" value={planName} />
        <Row label="Valid Till" value={validTill} />
      </Stack>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default TenantSubscriptionWidget;
