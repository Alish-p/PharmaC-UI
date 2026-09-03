// DriverSalaryView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { useTenantContext } from 'src/auth/tenant';

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

function RenderHeader({ driverSalary }) {
  const { paymentId, status } = driverSalary || {};
  const tenant = useTenantContext();
  return (
    <Box
      rowGap={3}
      display="grid"
      alignItems="center"
      gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
      sx={{ mb: 2 }}
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
        <Label
          variant="soft"
          color={
            status === 'paid'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : status === 'overdue'
                  ? 'error'
                  : 'default'
          }
        >
          {status?.toUpperCase() || 'DRAFT'}
        </Label>
        <Typography variant="h6">{paymentId || 'DSR - XXX'}</Typography>
      </Stack>
    </Box>
  );
}

function RenderAddress({ title, children }) {
  return (
    <Stack sx={{ typography: 'body2' }} mb={2}>
      <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function RenderTable({ driverSalary }) {
  const {
    subtripSnapshot = [],
    summary = {},
    additionalPayments = [],
    additionalDeductions = [],
  } = driverSalary;
  const navigate = useNavigate();

  return (
    <TableContainer>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <StyledTableCell>SR.NO</StyledTableCell>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell>Job No</StyledTableCell>
            <StyledTableCell>From</StyledTableCell>
            <StyledTableCell>Destination</StyledTableCell>
            <StyledTableCell align="right">Trip Salary</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subtripSnapshot.map((st, idx) => (
            <TableRow key={st.subtripId}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{fDate(st.startDate)}</TableCell>
              <TableCell
                sx={{ color: 'success.main', cursor: 'pointer' }}
                onClick={() => navigate(paths.dashboard.subtrip.details(st.subtripId))}
              >
                {st.subtripNo}
              </TableCell>
              <TableCell>{st.loadingPoint}</TableCell>
              <TableCell>{st.unloadingPoint}</TableCell>
              <TableCell align="right">{st.totalDriverSalary}</TableCell>
            </TableRow>
          ))}

          <StyledTableRow>
            <TableCell colSpan={5} align="right">
              Trips Total
            </TableCell>
            <StyledTableCell align="right">
              {fCurrency(summary.totalTripWiseIncome)}
            </StyledTableCell>
          </StyledTableRow>

          {additionalPayments.map((p, i) => (
            <StyledTableRow key={`pay-${i}`}>
              <TableCell colSpan={5} align="right">
                {p.label}
              </TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>
                +{fCurrency(p.amount)}
              </TableCell>
            </StyledTableRow>
          ))}

          {additionalDeductions.map((d, i) => (
            <StyledTableRow key={`ded-${i}`}>
              <TableCell colSpan={5} align="right">
                {d.label}
              </TableCell>
              <TableCell align="right" sx={{ color: 'error.main' }}>
                -{fCurrency(d.amount)}
              </TableCell>
            </StyledTableRow>
          ))}

          <StyledTableRow>
            <TableCell colSpan={5} align="right">
              <strong>Net Total</strong>
            </TableCell>
            <StyledTableCell align="right" sx={{ color: 'success.main' }}>
              <strong>{fCurrency(summary.netIncome)}</strong>
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function RenderFooter() {
  const tenant = useTenantContext();
  return (
    <Grid container sx={{ py: 3 }}>
      <Grid item xs={12} md={9}>
        <Typography variant="subtitle2">NOTES</Typography>
        <Typography variant="body2">{tenant?.name}</Typography>
      </Grid>
      <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
        <Typography variant="subtitle2">For – {tenant?.name}</Typography>
        <Typography variant="body2">Authorised Signatory</Typography>
      </Grid>
    </Grid>
  );
}

export default function DriverSalaryView({ driverSalary }) {
  const { driverId: driver, billingPeriod, issueDate } = driverSalary || {};
  const tenant = useTenantContext();

  return (
    <Card sx={{ pt: 5, px: 5 }}>
      <RenderHeader driverSalary={driverSalary} />

      <Box display="grid" rowGap={4} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
        <RenderAddress title="Salary From">
          <>
            {tenant?.name}
            <br />
            {tenant?.address?.line1}
            <br />
            {tenant?.address?.line2}
            <br />
            {tenant?.address?.state}
            <br />
            Phone: {tenant?.contactDetails?.phone}
          </>
        </RenderAddress>

        <RenderAddress title="Salary To">
          {driver && (
            <>
              {driver.driverName}
              <br />
              {driver.driverPresentAddress}
              <br />
              Phone: {driver.driverCellNo}
              {driver.bankDetails?.name && (
                <>
                  <br />
                  Bank: {driver.bankDetails.name}
                  {driver.bankDetails?.accNo && (
                    <>
                      <br />
                      A/C: {driver.bankDetails.accNo}
                    </>
                  )}
                  {driver.bankDetails?.ifsc && (
                    <>
                      <br />
                      IFSC: {driver.bankDetails.ifsc}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </RenderAddress>

        <RenderAddress title="Issue Date">{issueDate && fDate(issueDate)}</RenderAddress>

        <RenderAddress title="Billing Period">
          {billingPeriod && fDateRangeShortLabel(billingPeriod.start, billingPeriod.end)}
        </RenderAddress>
      </Box>

      <RenderTable driverSalary={driverSalary} />

      <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

      <RenderFooter />
    </Card>
  );
}
