// ------------------------------------------------------------------------
import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Button, Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useBoolean } from '../../hooks/use-boolean';
import { useCreateExpense } from '../../query/use-expense';
import { usePaymentMethods, useVehicleExpenseTypes } from './expense-config';
import { KanbanVehicleDialog } from '../kanban/components/kanban-vehicle-dialog';

export const ExpenseSchema = zod
  .object({
    vehicleId: zod
      .object({
        label: zod.string(),
        value: zod.string(),
      })
      .nullable()
      .optional(),
    date: schemaHelper.date({ message: { required_error: 'Start date is required!' } }),
    expenseType: zod.string().min(1, { message: 'Expense Type is required' }),

    amount: zod
      .number({ required_error: 'Amount is required' })
      .min(0, { message: 'Amount must be at least 0' }),
    slipNo: zod.string().min(1, { message: 'Slip No is required' }),
    remarks: zod.string().optional(),
    paidThrough: zod.string().min(1, { message: 'Paid Through is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.date && dayjs(data.date).isAfter(dayjs(), 'day')) {
      ctx.addIssue({ path: ['date'], message: 'Expense date cannot be in the future' });
    }
  });
// ------------------------------------------------------------------------

export default function VehicleExpenseForm({ currentExpense }) {
  const navigate = useNavigate();
  const vehicleDialog = useBoolean(false);
  const [selectedVehicle, setSelectedVehicle] = useState(currentExpense?.vehicleId || null);

  const expenseTypes = useVehicleExpenseTypes();
  const paymentMethods = usePaymentMethods();

  const createExpense = useCreateExpense();
  const updateExpense = useCreateExpense();

  const defaultValues = useMemo(
    () => ({
      vehicleId: currentExpense?.vehicleId
        ? { label: currentExpense?.vehicleId?.vehicleNo, value: currentExpense?.vehicleId?._id }
        : null,
      date: currentExpense?.date ? new Date(currentExpense?.date) : new Date(),
      expenseType: currentExpense?.expenseType || '',
      amount: currentExpense?.amount || 0,
      slipNo: currentExpense?.slipNo || '',
      remarks: currentExpense?.remarks || '',
      paidThrough: currentExpense?.paidThrough || '',
    }),
    [currentExpense]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ExpenseSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleVehicleChange = (vehicle) => {
    setSelectedVehicle(vehicle);
    setValue('vehicleId', { label: vehicle.vehicleNo, value: vehicle._id });
  };

  const onSubmit = async (data) => {
    try {
      const transformedData = {
        ...data,
        expenseCategory: 'vehicle',
        vehicleId: data.vehicleId?.value || null,
      };

      if (!currentExpense) {
        await createExpense(transformedData);
      } else {
        await updateExpense({ id: currentExpense._id, data: transformedData });
      }
      reset();

      navigate(paths.dashboard.expense.list);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ pt: 5 }}>
        <Grid item xs={12} md={3}>
          <Box sx={{ pt: 2, pb: 5, px: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Expense Details
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Please provide the details of the Expense.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns="repeat(2, 1fr)">
              <Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={vehicleDialog.onTrue}
                  sx={{
                    height: 56,
                    justifyContent: 'flex-start',
                    typography: 'body2',
                  }}
                  startIcon={
                    <Iconify
                      icon={selectedVehicle ? 'mdi:truck' : 'mdi:truck-outline'}
                      sx={{ color: selectedVehicle ? 'primary.main' : 'text.disabled' }}
                    />
                  }
                >
                  {selectedVehicle ? selectedVehicle.vehicleNo : 'Select Vehicle'}
                </Button>
              </Box>

              <Field.DatePicker name="date" label="Date" maxDate={dayjs()} />
              <Field.Select name="expenseType" label="Expense Type">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {expenseTypes.map(({ label, icon }) => (
                  <MenuItem key={label} value={label}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {icon ? <Iconify icon={icon} /> : null}
                      <Typography variant="body2" noWrap>
                        {label}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text name="amount" label="Amount" type="number" />
              <Field.Text name="slipNo" label="Slip No" />
              <Field.Text name="remarks" label="Remarks" />
              <Field.Select name="paidThrough" label="Paid Through">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {paymentMethods.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentExpense ? 'Create Expense' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        onlyOwn
        onlyActive
      />
    </Form>
  );
}
