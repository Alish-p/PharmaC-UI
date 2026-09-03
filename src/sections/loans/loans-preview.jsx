import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useTenantContext } from 'src/auth/tenant';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

function RenderHeader({ loan }) {
  const { status, loanNo, createdAt } = loan;
  const tenant = useTenantContext();

  return (
    <Box
      rowGap={3}
      display="grid"
      alignItems="center"
      gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
      sx={{ mb: 3 }}
    >
      <Box
        component="img"
        alt="logo"
        src={getTenantLogoUrl(tenant)}
        sx={{
          width: 60,
          height: 60,
          bgcolor: 'background.neutral',
          borderRadius: '10px',
        }}
      />
      <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
        <Label variant="soft" color={status === 'active' ? 'warning' : 'success'}>
          {status === 'active' ? 'Active' : 'Closed'}
        </Label>
        <Typography variant="h6">Loan</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {loanNo ? `Loan No: ${loanNo}` : 'Loan No: -'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {createdAt ? fDate(createdAt) : '-'}
        </Typography>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function RenderBorrowerInfo({ loan }) {
  const { borrowerId: borrower, borrowerType, disbursementDate } = loan;
  const tenant = useTenantContext();

  const borrowerName = borrower?.driverName || borrower?.transportName || '-';
  const borrowerPhone = borrower?.driverCellNo || borrower?.cellNo || '-';
  const borrowerAddress = borrower?.driverPresentAddress || borrower?.address || '';

  return (
    <Stack
      spacing={{ xs: 3, md: 5 }}
      direction={{ xs: 'column', md: 'row' }}
      divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
    >
      <Stack sx={{ width: 1 }}>
        <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
          From:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="subtitle2">{tenant?.name}</Typography>
          <Typography variant="body2">{tenant?.address?.line1}</Typography>
          {tenant?.address?.line2 && (
            <Typography variant="body2">{tenant?.address?.line2}</Typography>
          )}
          {tenant?.address?.state && (
            <Typography variant="body2">{tenant?.address?.state}</Typography>
          )}
          {tenant?.contactDetails?.phone && (
            <Typography variant="body2">Phone: {tenant?.contactDetails?.phone}</Typography>
          )}
        </Stack>
      </Stack>

      <Stack sx={{ width: 1 }}>
        <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
          Borrower:
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
              Name:
            </Typography>
            <Typography variant="subtitle2">{borrowerName}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
              Type:
            </Typography>
            <Label variant="soft" color="info">
              {borrowerType}
            </Label>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
              Phone:
            </Typography>
            <Typography variant="body2">{borrowerPhone}</Typography>
          </Stack>
          {borrowerAddress && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Address:
              </Typography>
              <Typography variant="body2">{borrowerAddress}</Typography>
            </Stack>
          )}
          {borrower?.driverLicenceNo && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                License:
              </Typography>
              <Typography variant="body2">{borrower.driverLicenceNo}</Typography>
            </Stack>
          )}
          {borrower?.gstNo && (
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                GST:
              </Typography>
              <Typography variant="body2">{borrower.gstNo}</Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
              Disbursed:
            </Typography>
            <Typography variant="body2">
              {disbursementDate ? fDate(disbursementDate) : '-'}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function RenderLoanSummary({ loan }) {
  const { principalAmount, outstandingBalance, remarks, payments = [] } = loan;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Box
      sx={{
        mt: 4,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
      }}
    >
      <Card variant="outlined" sx={{ p: 2.5, height: 1, bgcolor: 'background.neutral' }}>
        <Stack spacing={1.5} sx={{ height: 1 }}>
          <Typography variant="subtitle2" color="green">
            Remarks
          </Typography>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                color: remarks ? 'text.primary' : 'text.disabled',
                lineHeight: 1.7,
                display: '-webkit-box',
                WebkitLineClamp: 8,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {remarks || 'No remarks provided'}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2.5, height: 1, bgcolor: 'background.neutral' }}>
        <Stack spacing={2} sx={{ height: 1 }}>
          <Typography variant="subtitle2" color="green">
            Financial Summary
          </Typography>
          <Stack spacing={1.5} sx={{ flexGrow: 1, justifyContent: 'center' }}>
            <SummaryRow label="Loan Amount" value={fCurrency(principalAmount)} />
            <SummaryRow label="Total Paid" value={fCurrency(totalPaid)} color="success.main" />
            <Divider sx={{ my: 0.5 }} />
            <SummaryRow
              label="Remaining Balance"
              value={fCurrency(outstandingBalance)}
              bold
              color={outstandingBalance > 0 ? 'error.main' : 'success.main'}
              highlight
            />
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}

// ----------------------------------------------------------------------

function RenderPayments({ loan }) {
  const { payments = [] } = loan;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle2" color="green" sx={{ mb: 2 }}>
        Payment History
      </Typography>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No payments recorded yet
                </TableCell>
              </TableRow>
            )}

            {payments.map((p, idx) => (
              <StyledTableRow key={p._id || idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{fDate(p.paymentDate)}</TableCell>
                <TableCell>
                  <Label variant="soft" color="info" sx={{ textTransform: 'none' }}>
                    {p.source || 'Manual'}
                  </Label>
                </TableCell>
                <TableCell>{p.remarks || '-'}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={0.5}
                  >
                    <Iconify
                      icon="eva:checkmark-circle-2-fill"
                      sx={{ color: 'success.main' }}
                      width={16}
                    />
                    <Typography variant="body2">{fCurrency(p.amount)}</Typography>
                  </Stack>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ----------------------------------------------------------------------

function SummaryRow({ label, value, bold, color, highlight }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant={bold ? 'subtitle2' : 'body2'}
        sx={{
          color: color || (highlight ? 'primary.main' : 'text.primary'),
          fontWeight: bold || highlight ? 600 : undefined,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default function LoansPreview({ loan }) {
  return (
    <Card sx={{ p: 3 }}>
      <RenderHeader loan={loan} />

      <RenderBorrowerInfo loan={loan} />

      <RenderPayments loan={loan} />

      <RenderLoanSummary loan={loan} />

      <Divider sx={{ mt: 4, borderStyle: 'dashed' }} />
    </Card>
  );
}
