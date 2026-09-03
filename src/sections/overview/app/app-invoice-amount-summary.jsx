import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';
import { exportBillingSummaryToExcel } from 'src/utils/export-billing-summary-to-excel';

import { useInvoiceAmountSummary } from 'src/query/use-dashboard';
import { useCustomerInvoiceAmountSummary } from 'src/query/use-customer';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function AppInvoiceAmountSummary({ customerId, ...other }) {
  const theme = useTheme();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;

  const [selectedYear, setSelectedYear] = useState(startYear);

  const yearOptions = Array.from({ length: 3 }, (_, i) => startYear - i);

  const { data: globalSummary } = useInvoiceAmountSummary(selectedYear, {
    enabled: !customerId,
  });

  const { data: customerSummary } = useCustomerInvoiceAmountSummary(customerId, selectedYear, {
    enabled: !!customerId,
  });

  const summary = customerId ? customerSummary : globalSummary;

  const ITEMS = summary
    ? [
        {
          title: 'Not Billed Amount',
          description:
            'Amount for freight for which subtrips POD received but not yet processed for billing',
          amount: summary.unbilledAmount,
          icon: 'mdi:clock-outline',
          color: theme.palette.warning.main,
        },
        {
          title: 'Receivable Amount',
          description: 'Invoice generated and sent to customer but payment is still pending',
          amount: summary.pendingAmount,
          icon: 'mdi:clipboard-list-outline',
          color: theme.palette.info.main,
        },
        {
          title: 'Received Amount',
          description: 'Invoice amount successfully paid by customer and received',
          amount: summary.receivedAmount,
          icon: 'mdi:check-decagram-outline',
          color: theme.palette.success.main,
        },
      ]
    : [];

  const totalOutstanding = summary ? summary.unbilledAmount + summary.pendingAmount : 0;

  return (
    <Card {...other}>
      <CardHeader
        title="Customer Billing Summary"
        sx={{ mb: 2 }}
        action={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Select
              size="small"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ minWidth: 120, mr: 1 }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  FY {year}–{String(year + 1).slice(-2)}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Download Excel">
              <span>
                <IconButton
                  onClick={() => exportBillingSummaryToExcel(summary)}
                  disabled={!summary}
                >
                  <Iconify icon="file-icons:microsoft-excel" />
                </IconButton>
              </span>
            </Tooltip>

          </Stack>
        }
      />

      {!summary ? (
        <>
          <Scrollbar>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="space-around"
              flexWrap="wrap"
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderStyle: 'dashed', display: { xs: 'none', md: 'block' } }}
                />
              }
              sx={{ px: 3, py: 2, gap: 2 }}
            >
              {[...Array(3)].map((_, index) => (
                <Stack
                  key={index}
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    minWidth: { xs: 1, md: 160 },
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={80} height={24} />
                </Stack>
              ))}
            </Stack>
          </Scrollbar>
          <Divider sx={{ borderStyle: 'dashed', mt: 1 }} />
          <Stack direction="row" justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
            <Skeleton variant="text" width={140} height={20} />
          </Stack>
        </>
      ) : (
        <>
          <Scrollbar>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="space-around"
              flexWrap="wrap"
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderStyle: 'dashed', display: { xs: 'none', md: 'block' } }}
                />
              }
              sx={{ px: 3, py: 2, gap: 2 }}
            >
              {ITEMS.map((item) => (
                <Tooltip key={item.title} title={item.description}>
                  <Stack
                    spacing={1}
                    alignItems="center"
                    sx={{
                      minWidth: { xs: 1, md: 160 },
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      transition: (t) =>
                        t.transitions.create(['box-shadow', 'transform', 'background-color'], {
                          duration: t.transitions.duration.shorter,
                        }),
                      '&:hover': {
                        bgcolor: alpha(item.color, 0.08),
                        boxShadow: (t) => t.shadows[4],
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        border: `1px solid ${alpha(item.color, 0.4)}`,
                        bgcolor: alpha(item.color, 0.1),
                      }}
                    >
                      <Iconify icon={item.icon} width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.title}
                    </Typography>
                    <Typography variant="h6">₹ {fShortenNumber(item.amount)}</Typography>
                  </Stack>
                </Tooltip>
              ))}
            </Stack>
          </Scrollbar>
          <Divider sx={{ borderStyle: 'dashed', mt: 1 }} />
          <Stack direction="row" justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>
              Total Outstanding:
            </Typography>
            <Typography variant="subtitle2">{fShortenNumber(totalOutstanding)}</Typography>
          </Stack>
        </>
      )}
    </Card>
  );
}
