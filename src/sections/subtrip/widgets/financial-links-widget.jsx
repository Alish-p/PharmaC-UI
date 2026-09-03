import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Chip, Link, Stack, Divider, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { bgGradient } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function LinkRow({ icon, label, linkText, href, color = 'primary', generated = true }) {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Icon — same gradient circle as AnalyticsWidgetSummary */}
      <Box
        sx={{
          p: 1.5,
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: '50%',
          color: theme.palette[color].dark,
          ...bgGradient({
            direction: '135deg',
            startColor: `${alpha(theme.palette[color].dark, 0)} 0%`,
            endColor: `${alpha(theme.palette[color].dark, 0.24)} 100%`,
          }),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>

      <Stack spacing={0.2} flex={1}>
        <Typography
          variant="caption"
          sx={{ opacity: 0.64, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}
        </Typography>

        {generated && href ? (
          <Link
            component={RouterLink}
            href={href}
            variant="subtitle2"
            underline="hover"
            sx={{ fontWeight: 700 }}
          >
            {linkText}
          </Link>
        ) : (
          <Chip
            label="Yet to Generate"
            size="small"
            icon={<Iconify icon="mdi:clock-outline" width={13} />}
            sx={{
              width: 'fit-content',
              height: 20,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: alpha(theme.palette[color].dark, 0.1),
              color: theme.palette[color].darker,
              '& .MuiChip-icon': { color: theme.palette[color].darker },
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

/**
 * Single card showing Invoice + Driver Salary (own) or Transporter Payment (market).
 * Styled to match AnalyticsWidgetSummary (lighter bg, darker text).
 */
export function FinancialLinksWidget({ subtrip, isMarketVehicle, sx }) {
  const theme = useTheme();

  const invoice = subtrip?.invoiceId;
  const driverSalary = subtrip?.driverSalaryId;
  const transporterPayment = subtrip?.transporterPaymentReceiptId;

  return (
    <Card
      sx={{
        py: 3,
        px: 3,
        boxShadow: 0,
        color: theme.palette.primary.darker,
        bgcolor: theme.palette.primary.lighter,
        ...sx,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
        <Iconify icon="mdi:file-document-multiple-outline" width={20} sx={{ opacity: 0.7 }} />
        <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
          Financial Documents
        </Typography>
      </Stack>

      <Stack
        spacing={2}
        divider={<Divider flexItem sx={{ borderStyle: 'dashed', opacity: 0.4 }} />}
      >
        {/* Invoice */}
        <LinkRow
          icon="mdi:receipt-text-outline"
          label="Invoice"
          linkText={invoice?.invoiceNo ? `INV-${invoice.invoiceNo}` : invoice?.invoiceNo}
          href={invoice?._id ? `/dashboard/invoice/${invoice._id}` : null}
          color="primary"
          generated={Boolean(invoice)}
        />

        {/* Driver Salary or Transporter Payment */}
        {isMarketVehicle ? (
          <LinkRow
            icon="mdi:bank-transfer-out"
            label="Transporter Payment"
            linkText={transporterPayment?.paymentId}
            href={
              transporterPayment?._id
                ? `/dashboard/transporterPayment/${transporterPayment._id}`
                : null
            }
            color="warning"
            generated={Boolean(transporterPayment)}
          />
        ) : (
          <LinkRow
            icon="mdi:account-cash-outline"
            label="Driver Salary"
            linkText={driverSalary?.paymentId}
            href={driverSalary?._id ? `/dashboard/driverSalary/${driverSalary._id}` : null}
            color="success"
            generated={Boolean(driverSalary)}
          />
        )}
      </Stack>
    </Card>
  );
}
