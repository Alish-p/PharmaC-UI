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

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import {
  fFreightRate,
  getWeightUnit,
  calculateTotalWeight,
  getFreightExplanation,
  calculateTotalShortageWeight,
} from 'src/sections/subtrip/utils';

import { useTenantContext } from 'src/auth/tenant';

import { INVOICE_STATUS, INVOICE_STATUS_COLOR } from './invoice-config';

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

function RenderHeader({ invoice }) {
  const {
    invoiceNo,
    invoiceStatus,
    cancellationRemarks,
    netTotal = 0,
    totalReceived = 0,
  } = invoice || {};
  const tenant = useTenantContext();
  const remainingAmount = Math.max(0, netTotal - totalReceived);

  const statusLabel = (
    <Label variant="soft" color={INVOICE_STATUS_COLOR[invoiceStatus] || 'default'}>
      {invoiceStatus || 'Draft'}
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
        {invoiceStatus === INVOICE_STATUS.CANCELLED && cancellationRemarks ? (
          <Tooltip title={cancellationRemarks}>{statusLabel}</Tooltip>
        ) : (
          statusLabel
        )}
        <Typography variant="h6">{invoiceNo || 'INV - XXX'}</Typography>
        {remainingAmount > 0 && (
          <Typography variant="body2" color="error.main">
            Remaining: {fCurrency(remainingAmount)}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function RenderAddress({ title, details }) {
  return (
    <Stack sx={{ typography: 'body2' }}>
      <Typography variant="subtitle2" color="green" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {details && details}
    </Stack>
  );
}

function RenderDateInfo({ issueDate, dueDate }) {
  return (
    <>
      <RenderAddress title="Created" details={issueDate && fDate(issueDate)} />
      <RenderAddress title="Due Date" details={dueDate && fDate(dueDate)} />
    </>
  );
}

function RenderTable({ invoice }) {
  const {
    taxBreakup,
    totalAmountBeforeTax,
    subtripSnapshot = [],
    netTotal,
    additionalCharges,
  } = invoice || {};
  const { cgst, sgst, igst } = taxBreakup || {};
  const navigate = useNavigate();

  return (
    <TableContainer sx={{ overflowX: 'auto', mt: 4 }}>
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <StyledTableCell width={40}>#</StyledTableCell>
            <StyledTableCell>Consignee</StyledTableCell>
            <StyledTableCell>Destination</StyledTableCell>
            <StyledTableCell>Invoice No</StyledTableCell>
            <StyledTableCell>Disp Date</StyledTableCell>
            <StyledTableCell>LR No</StyledTableCell>
            <StyledTableCell>DI/DC No</StyledTableCell>
            <StyledTableCell>Vehicle No</StyledTableCell>
            <StyledTableCell>Material</StyledTableCell>
            <StyledTableCell>Rate</StyledTableCell>
            <StyledTableCell align="right">Weight</StyledTableCell>
            <StyledTableCell>Freight Amount</StyledTableCell>
            <StyledTableCell>Shortage</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subtripSnapshot.map((st, index) => (
            <TableRow key={st.subtripId}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{st.consignee}</TableCell>
              <TableCell>{st.unloadingPoint}</TableCell>
              <TableCell>{st.invoiceNo || '-'}</TableCell>
              <TableCell>{fDate(st.startDate)}</TableCell>
              <TableCell
                sx={{ color: 'success.main', cursor: 'pointer' }}
                onClick={() => navigate(paths.dashboard.subtrip.details(st.subtripId))}
              >
                {st.subtripNo}
              </TableCell>
              <TableCell>{st.diNumber || '-'}</TableCell>
              <TableCell>{st.vehicleNo || '-'}</TableCell>
              <TableCell>{st.materialType || '-'}</TableCell>
              <TableCell>
                {fFreightRate(
                  st.freightDetails?.rate || 0,
                  st.freightDetails?.freightModel,
                  st.freightDetails?.freightAmount
                )}
              </TableCell>
              <TableCell align="right">
                {st.loadingWeight ? `${fNumber(st.loadingWeight)} ${getWeightUnit(st)}` : '-'}
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>{fCurrency(st.freightDetails?.freightAmount || st.totalAmount || 0)}</span>
                  <Tooltip title={getFreightExplanation(st, false)} arrow placement="top">
                    <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                      <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.disabled' }} />
                    </Box>
                  </Tooltip>
                </Stack>
              </TableCell>
              <TableCell sx={{ color: st.shortageWeight > 0 ? '#FF5630' : 'inherit' }}>
                {st.shortageWeight ? `${fNumber(st.shortageWeight)} ${getWeightUnit(st)}` : '-'}
              </TableCell>
            </TableRow>
          ))}

          <StyledTableRow>
            <TableCell colSpan={9} />
            <StyledTableCell align="right">Total</StyledTableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {calculateTotalWeight(subtripSnapshot)}
            </TableCell>
            <TableCell>{fCurrency(totalAmountBeforeTax)}</TableCell>
            <TableCell sx={{ color: '#FF5630', fontWeight: 'bold' }}>
              {calculateTotalShortageWeight(subtripSnapshot)}
            </TableCell>
          </StyledTableRow>

          {cgst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10} />
              <StyledTableCell>CGST {cgst.rate}%</StyledTableCell>
              <TableCell>{fCurrency(cgst.amount)}</TableCell>
              <TableCell />
            </StyledTableRow>
          )}

          {sgst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10} />
              <StyledTableCell>SGST {sgst.rate}%</StyledTableCell>
              <TableCell>{fCurrency(sgst.amount)}</TableCell>
              <TableCell />
            </StyledTableRow>
          )}

          {igst?.rate > 0 && (
            <StyledTableRow>
              <TableCell colSpan={10} />
              <StyledTableCell>IGST {igst.rate}%</StyledTableCell>
              <TableCell>{fCurrency(igst.amount)}</TableCell>
              <TableCell />
            </StyledTableRow>
          )}

          {additionalCharges?.map(({ label, amount }, index) => (
            <StyledTableRow key={index}>
              <TableCell colSpan={10} />
              <StyledTableCell>{label}</StyledTableCell>
              <TableCell sx={{ color: amount < 0 ? 'error.main' : 'default' }}>
                {fCurrency(amount)}
              </TableCell>
              <TableCell />
            </StyledTableRow>
          ))}

          <StyledTableRow>
            <TableCell colSpan={10} />
            <StyledTableCell>Net Total</StyledTableCell>
            <TableCell sx={{ color: 'error.main' }}>{fCurrency(netTotal)}</TableCell>
            <TableCell />
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

export default function InvoiceView({ invoice }) {
  const { customerId: customer, issueDate, dueDate } = invoice;
  const tenant = useTenantContext();

  return (
    <Card sx={{ pt: 5, px: 5 }}>
      <RenderHeader invoice={invoice} />
      <Box
        rowGap={5}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      >
        <RenderAddress
          title="Invoice From"
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
          title="Invoice To"
          details={
            <>
              {customer?.customerName}
              <br />
              {customer?.address}
              <br />
              {customer?.state}
              <br />
              Phone: {customer?.cellNo}
            </>
          }
        />
        <RenderDateInfo issueDate={issueDate} dueDate={dueDate} />
      </Box>

      <RenderTable invoice={invoice} />
      <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />
      <RenderFooter />
    </Card>
  );
}
