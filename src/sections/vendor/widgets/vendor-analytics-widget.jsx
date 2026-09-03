import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';

import { usePaginatedPurchaseOrders } from 'src/query/use-purchase-order';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ANALYTICS_CARDS = [
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: 'solar:document-bold-duotone',
    color: 'primary',
    getValue: (totals) => totals.all?.count || 0,
    isCurrency: false,
  },
  {
    key: 'totalSpend',
    label: 'Total Spend',
    icon: 'solar:wallet-money-bold-duotone',
    color: 'warning',
    getValue: (totals) => totals.all?.amount || 0,
    isCurrency: true,
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'solar:clock-circle-bold-duotone',
    color: 'warning',
    getValue: (totals) => totals.pendingApproval?.count || 0,
    isCurrency: false,
  },
  {
    key: 'received',
    label: 'Received',
    icon: 'solar:check-circle-bold-duotone',
    color: 'success',
    getValue: (totals) => totals.received?.count || 0,
    isCurrency: false,
  },
];

// ----------------------------------------------------------------------

export function VendorAnalyticsWidget({ vendorId }) {
  const theme = useTheme();

  // Fetch all POs for this vendor (page 1, limit 1) – we only need the totals
  const { data, isLoading } = usePaginatedPurchaseOrders({
    vendor: vendorId,
    page: 1,
    rowsPerPage: 1,
  });

  const totals = data?.totals || {};

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {ANALYTICS_CARDS.map((card) => {
        const paletteColor = theme.palette[card.color] || theme.palette.primary;
        const value = card.getValue(totals);

        return (
          <Card
            key={card.key}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(paletteColor.main, 0.12),
                color: paletteColor.main,
                flexShrink: 0,
              }}
            >
              <Iconify icon={card.icon} width={28} />
            </Box>

            <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {card.label}
              </Typography>

              {isLoading ? (
                <Skeleton variant="text" width={80} />
              ) : (
                <Typography variant="h4" noWrap>
                  {card.isCurrency ? fCurrency(value) : value}
                </Typography>
              )}
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}
