import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Box,
  Card,
  Chip,
  Table,
  Paper,
  Stack,
  Button,
  Tooltip,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { useDeleteExpense } from 'src/query/use-expense';
import { useDeleteTransporterAdvance } from 'src/query/use-transporter-advance';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { TableNoData } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useSubtripExpenseTypes } from '../../expense/expense-config';

export const BasicExpenseTable = ({ selectedSubtrip, withDelete = false, withAdd = false }) => {
  const deleteExpense = useDeleteExpense();
  const deleteAdvance = useDeleteTransporterAdvance();
  const navigate = useNavigate();
  const confirm = useBoolean();
  const subtripExpenseTypes = useSubtripExpenseTypes();

  const [selectedItem, setSelectedItem] = useState(null);

  // Determine if this is a market vehicle subtrip (use advances) or own vehicle (use expenses)
  const isMarketVehicle = selectedSubtrip?.vehicleId?.isOwn === false;
  const items = isMarketVehicle ? selectedSubtrip?.advances || [] : selectedSubtrip?.expenses || [];
  const activeItems = items.filter(
    (item) => item.status !== 'cancelled' && item.status !== 'Cancelled' && !item.isDeleted
  );
  const totalAmount = activeItems.reduce((acc, item) => acc + (item.amount || 0), 0);

  const label = isMarketVehicle ? 'Advances' : 'Expenses';

  const handleDelete = (item) => {
    if (isMarketVehicle) {
      deleteAdvance(item._id);
    } else {
      deleteExpense(item._id);
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Existing {label}</Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            label={`Total: ${fCurrency(totalAmount)}`}
            color="info"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          {withAdd && (
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => {
                navigate(`${paths.dashboard.expense.new}?currentSubtrip=${selectedSubtrip._id}`);
              }}
            >
              Add {isMarketVehicle ? 'Advance' : 'Expense'}
            </Button>
          )}
        </Stack>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" width="15%">
                Date
              </TableCell>
              <TableCell align="center" width="20%">
                Type
              </TableCell>
              <TableCell align="center" width="15%">
                Diesel Ltr
              </TableCell>
              <TableCell align="center" width="15%">
                Diesel Price
              </TableCell>
              <TableCell align="center" width="20%">
                Amount
              </TableCell>
              <TableCell align="center" width="15%">
                Remarks
              </TableCell>
              {withDelete && (
                <TableCell align="center" width="15%">
                  Delete
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => {
              const itemType = item.advanceType || item.expenseType;
              const isCancelled = item.status === 'cancelled' || item.status === 'Cancelled' || item.isDeleted;
              return (
                <TableRow key={item._id} hover sx={isCancelled ? { bgcolor: 'action.hover' } : {}}>
                  <TableCell align="center">{fDate(item.date)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Iconify
                        icon={
                          subtripExpenseTypes.find((type) => type.label === itemType)?.icon ||
                          'mdi:help-circle'
                        }
                        sx={{ color: isCancelled ? 'text.disabled' : 'primary.main' }}
                      />
                      <Typography variant="body2" noWrap sx={{ color: isCancelled ? 'text.disabled' : 'text.primary' }}>
                        {itemType}
                      </Typography>
                      {isCancelled && (
                        <Label variant="soft" color="error" sx={{ ml: 0.5 }}>
                          Cancelled
                        </Label>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {item.dieselLtr ? `${fNumber(item.dieselLtr)} L` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {item.dieselPrice ? `${fNumber(item.dieselPrice)}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        textDecoration: isCancelled ? 'line-through' : 'none',
                        color: isCancelled ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {fCurrency(item.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={item.remarks || '-'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120, color: isCancelled ? 'text.disabled' : 'text.primary' }}>
                        {item.remarks || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  {withDelete && (
                    <TableCell align="center">
                      {isCancelled ? (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          -
                        </Typography>
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            confirm.onTrue();
                            setSelectedItem(item);
                          }}
                        >
                          <Iconify icon="mdi:delete" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            <TableNoData notFound={items.length === 0} />
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`Delete ${isMarketVehicle ? 'Advance' : 'Expense'}`}
        content={`Are you sure you want to delete this ${isMarketVehicle ? 'advance' : 'expense'}?`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
              handleDelete(selectedItem);
            }}
          >
            Delete
          </Button>
        }
      />
    </Card>
  );
};
