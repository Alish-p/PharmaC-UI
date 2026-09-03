import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { useFuelPrices, useDeleteFuelPrice } from 'src/query/use-fuel-prices';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import DieselPriceForm from '../fuel-price-form';

export function PumpDieselPricesWidget({ pump, title = 'Fuel Prices', ...other }) {
  const table = useTable({ defaultOrderBy: 'fromDate', defaultRowsPerPage: 5 });

  const { data, isLoading } = useFuelPrices({
    pumpId: pump._id,
    page: table.page + 1,
    limit: table.rowsPerPage,
  });

  const dieselPrices = data?.fuelPrices || [];
  const totalCount = data?.total || 0;

  const formDialog = useBoolean();
  const [current, setCurrent] = useState(null);
  const confirmDelete = useBoolean();
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const deleteDieselPrice = useDeleteFuelPrice();

  const handleOpenCreate = () => {
    setCurrent(null);
    formDialog.onTrue();
  };

  const handleOpenEdit = (row) => {
    setCurrent(row);
    formDialog.onTrue();
  };

  const handleDelete = (row) => {
    setSelectedForDelete(row);
    confirmDelete.onTrue();
  };

  const handleClose = () => {
    setCurrent(null);
    formDialog.onFalse();
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        sx={{ mb: 3 }}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            New Fuel Price
          </Button>
        }
      />

      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.', align: 'center' },
              { id: 'fuelType', label: 'Fuel Type', align: 'center' },
              { id: 'status', label: 'Status', align: 'center' },
              { id: 'price', label: 'Price', align: 'center' },
              { id: 'time', label: 'Time', align: 'center' },
              { id: 'actions', label: 'Actions', align: 'center' },
            ]}
          />

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : dieselPrices.length ? (
              dieselPrices.map((row, idx) => (
                <TableRow key={row._id}>
                  <TableCell align="center">{table.page * table.rowsPerPage + idx + 1}</TableCell>
                  <TableCell align="center">
                    <Label
                      color={
                        row.fuelType === 'Diesel'
                          ? 'info'
                          : row.fuelType === 'Petrol'
                            ? 'warning'
                            : row.fuelType === 'CNG'
                              ? 'success'
                              : 'default'
                      }
                      variant="soft"
                    >
                      {row.fuelType}
                    </Label>
                  </TableCell>
                  <TableCell align="center">
                    <Label
                      color={
                        new Date() >= new Date(row.fromDate) && new Date() <= new Date(row.toDate)
                          ? 'success'
                          : 'default'
                      }
                      variant="soft"
                    >
                      {new Date() >= new Date(row.fromDate) && new Date() <= new Date(row.toDate)
                        ? 'Current'
                        : 'Past'}
                    </Label>
                  </TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                  <TableCell align="center">
                    {fDateRangeShortLabel(row.fromDate, row.toDate)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center">
                      <IconButton onClick={() => handleOpenEdit(row)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      <TablePaginationCustom
        count={totalCount}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />

      <Dialog fullWidth maxWidth="sm" open={formDialog.value} onClose={handleClose}>
        <DialogTitle>{current ? 'Edit Fuel Price' : 'New Fuel Price'}</DialogTitle>
        <DialogContent>
          <DieselPriceForm currentDieselPrice={current} pump={pump} onSuccess={handleClose} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Fuel Price"
        content="Are you sure you want to delete this fuel price?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedForDelete?._id) {
                deleteDieselPrice({ pumpId: pump._id, priceId: selectedForDelete._id });
              }
              confirmDelete.onFalse();
              setSelectedForDelete(null);
            }}
          >
            Delete
          </Button>
        }
      />
    </Card>
  );
}

export default PumpDieselPricesWidget;
