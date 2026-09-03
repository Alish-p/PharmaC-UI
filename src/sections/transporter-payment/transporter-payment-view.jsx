import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import {
  getWeightUnit,
  calculateTotalWeight,
  getFreightExplanation,
} from 'src/sections/subtrip/utils';

import { useTenantContext } from 'src/auth/tenant';

import { getTransporterPaymentStatusColor } from './utils/constant';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

function RenderHeader({ transporterPayment }) {
  const { paymentId, status, cancellationRemarks } = transporterPayment || {};
  const tenant = useTenantContext();

  const statusLabel = (
    <Label variant="soft" color={getTransporterPaymentStatusColor(status)}>
      {status || 'Draft'}
    </Label>
  );

  return (
    <Box
      rowGap={3}
      display="grid"
      alignItems="center"
      gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
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
        {status === 'cancelled' && cancellationRemarks ? (
          <Tooltip title={cancellationRemarks}>{statusLabel}</Tooltip>
        ) : (
          statusLabel
        )}
        <Typography variant="h6">{paymentId || 'TPR - XXX'}</Typography>
      </Stack>
    </Box>
  );
}

function RenderAddress({ title, details }) {
  return (
    <Stack sx={{ typography: 'body2' }} mb={2}>
      <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {details && details}
    </Stack>
  );
}

function RenderDateInfo({ issueDate, paidDate, billingPeriod }) {
  return (
    <>
      <RenderAddress title="Issue Date" details={issueDate && fDate(issueDate)} />
      {paidDate && <RenderAddress title="Paid Date" details={fDate(paidDate)} />}
      <RenderAddress
        title="Billing Period"
        details={billingPeriod && fDateRangeShortLabel(billingPeriod.start, billingPeriod.end)}
      />
    </>
  );
}

function RenderTable({ transporterPayment }) {
  const { subtripSnapshot, taxBreakup, summary, additionalCharges } = transporterPayment;

  const navigate = useNavigate();
  const { cgst, sgst, igst, tds } = taxBreakup || {};
  const { netIncome, totalExpense, totalShortageAmount, totalFreightAmount, totalTripWiseIncome } =
    summary || {};

  const totalWeightLabel = calculateTotalWeight(subtripSnapshot);
  return (
    <TableContainer>
      <Table sx={{ minWidth: 960, overflowX: 'auto' }}>
        <TableHead>
          <TableRow>
            <StyledTableCell width={40}>SR.NO</StyledTableCell>
            <StyledTableCell>Dispatch Date</StyledTableCell>
            <StyledTableCell>LR NO.</StyledTableCell>
            <StyledTableCell>VEH.NO</StyledTableCell>
            <StyledTableCell>From</StyledTableCell>
            <StyledTableCell>Destination</StyledTableCell>
            <StyledTableCell>InvoiceNo</StyledTableCell>
            <StyledTableCell align="right">Loading Weight</StyledTableCell>
            <StyledTableCell align="right">Shortage Qty(MT)</StyledTableCell>
            <StyledTableCell align="right">Shortage Amt</StyledTableCell>
            <StyledTableCell align="right">FRT-Amt</StyledTableCell>
            <StyledTableCell align="right">Deductions</StyledTableCell>
            <StyledTableCell align="right">Total Payable</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subtripSnapshot?.map((st, index) => (
            <TableRow key={st.subtripId}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{fDate(st.startDate)}</TableCell>
              <TableCell
                sx={{ color: 'success.main', cursor: 'pointer' }}
                onClick={() => navigate(paths.dashboard.subtrip.details(st.subtripId))}
              >
                {st.subtripNo}
              </TableCell>
              <TableCell>{st.vehicleNo}</TableCell>
              <TableCell>{st.loadingPoint}</TableCell>
              <TableCell>{st.unloadingPoint}</TableCell>
              <TableCell>{st.invoiceNo}</TableCell>
              <TableCell align="right">
                {st.loadingWeight ? `${fNumber(st.loadingWeight)} ${getWeightUnit(st)}` : '-'}
              </TableCell>
              <TableCell align="right">{st.shortageWeight}</TableCell>
              <TableCell align="right">{fCurrency(st.shortageAmount)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                  <span>{fCurrency(st.freightAmount)}</span>
                  <Tooltip title={getFreightExplanation(st, true)} arrow placement="top">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.disabled' }} />
                    </Box>
                  </Tooltip>
                </Stack>
              </TableCell>
              <TableCell align="right">{fCurrency(st.totalExpense)}</TableCell>
              <TableCell align="right">{fCurrency(st.totalTransporterPayment)}</TableCell>
            </TableRow>
          ))}

          <StyledTableRow>
            <TableCell colSpan={6} />
            <StyledTableCell align="right" sx={{ color: 'info.main' }}>
              Total
            </StyledTableCell>
            <TableCell sx={{ color: 'info.main' }} align="right">
              {totalWeightLabel}
            </TableCell>
            <TableCell />
            <TableCell sx={{ color: 'info.main' }} align="right">
              {fCurrency(totalShortageAmount)}
            </TableCell>
            <TableCell sx={{ color: 'info.main' }} align="right">
              {fCurrency(totalFreightAmount)}
            </TableCell>
            <TableCell sx={{ color: 'info.main' }} align="right">
              {fCurrency(totalExpense)}
            </TableCell>
            <TableCell sx={{ color: 'info.main' }} align="right">
              {fCurrency(totalTripWiseIncome)}
            </TableCell>
          </StyledTableRow>

          {tds?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10} />
              <StyledTableCell colSpan={2} align="right">
                TDS({tds?.rate || 0}%)
              </StyledTableCell>
              <TableCell align="right" sx={{ color: 'error.main' }}>
                {fCurrency(tds?.amount || 0)}
              </TableCell>
            </StyledTableRow>
          )}

          {cgst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10}>
                I/we have taken registration under the CGST Act, 2017 and have exercised the option
                to pay tax on services of GTA in relation to transport of goods supplied by us.
              </TableCell>
              <StyledTableCell colSpan={2} align="right">
                CGST {cgst.rate}%
              </StyledTableCell>
              <StyledTableCell align="right">{fCurrency(cgst.amount)}</StyledTableCell>
            </StyledTableRow>
          )}

          {sgst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10} />
              <StyledTableCell colSpan={2} align="right">
                SGST {sgst.rate}%
              </StyledTableCell>
              <StyledTableCell align="right">{fCurrency(sgst.amount)}</StyledTableCell>
            </StyledTableRow>
          )}

          {igst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10}>
                I/we have taken registration under the CGST Act, 2017 and have exercised the option
                to pay tax on services of GTA in relation to transport of goods supplied by us.
              </TableCell>
              <StyledTableCell colSpan={2} align="right">
                IGST {igst.rate}%
              </StyledTableCell>
              <StyledTableCell align="right" title="GST under RCM Mechnism">
                {fCurrency(igst.amount)}
              </StyledTableCell>
            </StyledTableRow>
          )}

          {additionalCharges?.length > 0 &&
            additionalCharges.map(({ label, amount }) => (
              <StyledTableRow key={label}>
                <TableCell colSpan={10} />
                <StyledTableCell colSpan={2} align="right">
                  {label}
                </StyledTableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  {fCurrency(amount || 0)}
                </TableCell>
              </StyledTableRow>
            ))}

          <StyledTableRow>
            <TableCell colSpan={10} />
            <StyledTableCell colSpan={2} align="right">
              Net-Payable
            </StyledTableCell>
            <TableCell align="right" sx={{ color: 'success.main' }}>
              {fCurrency(netIncome)}
            </TableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function RenderFooter() {
  const tenant = useTenantContext();
  return (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTES</Typography>
        <Typography variant="body2">{tenant?.name}</Typography>
      </Grid>
      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">For-{tenant?.name}</Typography>
        <Typography variant="body2">Authorised Signatory</Typography>
      </Grid>
    </Grid>
  );
}

export default function TransporterPaymentPreview({ transporterPayment }) {
  const { transporterId: transporter, issueDate, paidDate, billingPeriod } = transporterPayment || {};
  const tenant = useTenantContext();
  return (
    <Card sx={{ pt: 5, px: 5 }}>
      <RenderHeader transporterPayment={transporterPayment} />
      <Box
        rowGap={5}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      >
        <RenderAddress
          title="Transporter Payment From"
          details={
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
          }
        />
        <RenderAddress
          title="Payment To"
          details={
            transporter && (
              <>
                {transporter?.transportName}
                <br />
                {transporter?.address},{transporter?.pinNo}
                <br />
                {transporter?.cellNo && <>Phone: {transporter?.cellNo} </>}
                <br />
                {transporter?.panNo && <>Pan: {transporter?.panNo} </>}
                <br />
                {transporter?.gstNo && <>GST: {transporter?.gstNo} </>}
              </>
            )
          }
        />
        <RenderDateInfo issueDate={issueDate} paidDate={paidDate} billingPeriod={billingPeriod} />
      </Box>
      <RenderTable transporterPayment={transporterPayment} />
      <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />
      <RenderFooter />
    </Card>
  );
}
