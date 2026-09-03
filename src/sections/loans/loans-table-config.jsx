import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { LOAN_STATUS_COLOR } from './loans-config';

// ----------------------------------------------------------------------

const getBorrowerName = (row) => {
  if (row.borrowerType === 'Driver') return row.borrowerId?.driverName || '-';
  if (row.borrowerType === 'Transporter') return row.borrowerId?.transportName || '-';
  return '-';
};

const getBorrowerCell = (row) => {
  if (row.borrowerType === 'Driver') return row.borrowerId?.driverCellNo || '';
  if (row.borrowerType === 'Transporter') return row.borrowerId?.cellNo || '';
  return '';
};

export const TABLE_COLUMNS = [
  {
    id: 'loanNo',
    label: 'Loan No',
    defaultVisible: true,
    sortable: true,
    disabled: true,
    getter: (row) => row.loanNo,
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.loan.details(row._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {row.loanNo}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'borrower',
    label: 'Borrower',
    defaultVisible: true,
    disabled: true,
    getter: (row) => getBorrowerName(row),
    render: (row) => {
      const getBorrowerLink = () => {
        if (row.borrowerType === 'Driver') {
          return paths.dashboard.driver.details(row.borrowerId?._id);
        }
        if (row.borrowerType === 'Transporter') {
          return paths.dashboard.transporter.details(row.borrowerId?._id);
        }
        return '#';
      };

      return (
        <ListItemText
          disableTypography
          primary={
            row.borrowerId?._id ? (
              <Link
                component={RouterLink}
                href={getBorrowerLink()}
                variant="body2"
                noWrap
                sx={{ color: 'primary.main', cursor: 'pointer' }}
              >
                {getBorrowerName(row)}
              </Link>
            ) : (
              <Typography variant="body2" noWrap>
                {getBorrowerName(row)}
              </Typography>
            )
          }
          secondary={
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
              {getBorrowerCell(row)}
            </Typography>
          }
        />
      );
    },
  },
  {
    id: 'borrowerType',
    label: 'Type',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.borrowerType,
    render: (row) => (
      <Label variant="soft" color="info">
        {row.borrowerType}
      </Label>
    ),
  },
  {
    id: 'loanReason',
    label: 'Reason',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.loanReason || '-',
    render: (row) => (
      <ListItemText
        primary={row.loanReason || '-'}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'principalAmount',
    label: 'Loan Amount',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) => row.principalAmount,
    render: (row) => (
      <ListItemText
        primary={fCurrency(row.principalAmount)}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'outstandingBalance',
    label: 'Outstanding',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) => row.outstandingBalance,
    render: (row) => (
      <ListItemText
        primary={fCurrency(row.outstandingBalance || 0)}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'remarks',
    label: 'Remarks',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.remarks || '-',
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.status,
    render: (row) => (
      <Label variant="soft" color={LOAN_STATUS_COLOR[row.status] || 'default'}>
        {row.status}
      </Label>
    ),
  },
  {
    id: 'createdAt',
    label: 'Created',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => row.createdAt,
    render: (row) => (
      <ListItemText
        primary={fDate(new Date(row.createdAt))}
        secondary={fTime(new Date(row.createdAt))}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
];
