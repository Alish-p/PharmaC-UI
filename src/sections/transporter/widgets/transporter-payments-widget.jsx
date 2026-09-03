import { useState } from 'react';

import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { wrapText } from 'src/utils/change-case';
import { fCurrency } from 'src/utils/format-number';

import { usePaginatedTransporterPayments } from 'src/query/use-transporter-payment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function TransporterPaymentsWidget({ transporterId, title = 'Payments', ...other }) {
  const { data, isLoading } = usePaginatedTransporterPayments({
    transporterId,
    page: 1,
    rowsPerPage: 50,
  });
  const payments = data?.receipts || [];
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? payments : payments.slice(0, 6);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader="Transporter Payment Receipt for this Transporter"
        sx={{ mb: 3 }}
      />

      <Scrollbar sx={{ minHeight: 364, ...(showAll && { maxHeight: 364 }) }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'paymentId', label: 'Payment ID' },
              { id: 'subtrips', label: 'Jobs' },
              { id: 'status', label: 'Status', align: 'center' },
              { id: 'issueDate', label: 'Issue Date' },
              { id: 'amount', label: 'Amount', align: 'right' },
              { id: 'tds', label: 'TDS', align: 'right' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : payments.length ? (
              <>
                {displayed.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>
                      <Label variant="soft">
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.transporterPayment.details(row._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'text.disabled' }}
                        >
                          {row.paymentId}
                        </Link>
                      </Label>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const jobs = row.subtripSnapshot?.map((st) => st.subtripNo)?.join(', ');
                        return (
                          <Tooltip title={jobs}>
                            <ListItemText
                              primary={wrapText(jobs || '-', 30)}
                              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                            />
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Label variant="soft" color={row.status === 'paid' ? 'success' : 'error'}>
                        {row.status}
                      </Label>
                    </TableCell>
                    <TableCell>{fDate(new Date(row.issueDate))}</TableCell>
                    <TableCell align="right">
                      {fCurrency(row.summary?.netIncome ?? row.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {fCurrency(row.taxBreakup?.tds?.amount ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {payments.length > 6 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowAll((prev) => !prev)}
              endIcon={
                <Iconify
                  icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={18}
                  sx={{ ml: -0.5 }}
                />
              }
            >
              {showAll ? 'View less' : 'View all'}
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}

export default TransporterPaymentsWidget;
