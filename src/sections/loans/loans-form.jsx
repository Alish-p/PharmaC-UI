import dayjs from 'dayjs';
import { z as zod } from 'zod';
// form
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useMemo, useState, useEffect } from 'react';

// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Divider, MenuItem, CardHeader, InputAdornment } from '@mui/material';

// routes
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import { VEHICLE_MODES } from 'src/constants/vehicle-mode';
import { useCreateLoan, useUpdateLoan } from 'src/query/use-loan';

// components
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { RHFFreeSoloAutocomplete } from 'src/components/hook-form/rhf-autocomplete-freesolo';

import { KanbanDriverDialog } from 'src/sections/kanban/components/kanban-driver-dialog';
import { KanbanTransporterDialog } from 'src/sections/kanban/components/kanban-transporter-dialog';

import { LOAN_REASONS, BORROWER_TYPES } from './loans-config';

// ----------------------------------------------------------------------

export const LoansSchema = zod
  .object({
    borrowerId: zod.string().min(1),
    borrowerType: zod.string().min(1),
    loanReason: zod.any().optional(),
    principalAmount: zod.number().min(1, { message: 'Amount is required' }),
    remarks: zod.string().optional(),
    disbursementDate: schemaHelper
      .date({ message: { required_error: 'Issue date is required!' } })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.disbursementDate && dayjs(data.disbursementDate).isAfter(dayjs(), 'day')) {
      ctx.addIssue({ path: ['disbursementDate'], message: 'Issue date cannot be in the future' });
    }
  });

// ----------------------------------------------------------------------

export default function LoanForm({ currentLoan }) {
  const navigate = useNavigate();
  const updateLoan = useUpdateLoan();
  const createLoan = useCreateLoan();

  const defaultValues = useMemo(
    () => ({
      borrowerType: currentLoan?.borrowerType || '',
      borrowerId: currentLoan?.borrowerId?._id || '',
      principalAmount: currentLoan?.principalAmount || 0,
      remarks: currentLoan?.remarks || '',
      disbursementDate: currentLoan?.disbursementDate || new Date(),
      loanNo: currentLoan?.loanNo || '',
      loanReason: currentLoan?.loanReason || '',
    }),
    [currentLoan]
  );

  const methods = useForm({
    resolver: zodResolver(LoansSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const { borrowerType } = watch();

  const { vehicleMode } = useSystemFeatures();

  const availableBorrowerTypes = useMemo(
    () =>
      BORROWER_TYPES.filter((type) => {
        if (vehicleMode === VEHICLE_MODES.OWN_ONLY && type.key === 'Transporter') return false;
        return true;
      }),
    [vehicleMode]
  );

  // Dialog controls
  const driverDialog = useBoolean(false);
  const transporterDialog = useBoolean(false);

  // Local selection state for label display and dialog preselection
  const [selectedDriver, setSelectedDriver] = useState(
    currentLoan?.borrowerType === 'Driver' ? currentLoan?.borrowerId || null : null
  );
  const [selectedTransporter, setSelectedTransporter] = useState(
    currentLoan?.borrowerType === 'Transporter' ? currentLoan?.borrowerId || null : null
  );

  // Clear borrower when borrowerType changes (skip first render)
  const firstTypeRun = useRef(true);
  useEffect(() => {
    if (firstTypeRun.current) {
      firstTypeRun.current = false;
      return;
    }
    setValue('borrowerId', '');
    if (borrowerType === 'Driver') {
      setSelectedTransporter(null);
    } else if (borrowerType === 'Transporter') {
      setSelectedDriver(null);
    } else {
      setSelectedDriver(null);
      setSelectedTransporter(null);
    }
  }, [borrowerType, setValue]);

  const handleDriverChange = (driver) => {
    setSelectedDriver(driver);
    setValue('borrowerId', driver._id, { shouldValidate: true });
  };

  const handleTransporterChange = (transporter) => {
    setSelectedTransporter(transporter);
    setValue('borrowerId', transporter._id, { shouldValidate: true });
  };

  // Handle form submission (create or update)
  const onSubmit = async (formData) => {
    try {
      const data = { ...formData };
      if (data.loanReason && typeof data.loanReason === 'object') {
        data.loanReason =
          data.loanReason.inputValue || data.loanReason.value || data.loanReason.label || '';
      }

      if (currentLoan) {
        await updateLoan({ id: currentLoan._id, data });
        navigate(paths.dashboard.loan.details(currentLoan._id));
      } else {
        const newLoan = await createLoan(data);
        navigate(paths.dashboard.loan.details(newLoan._id));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing the loan.');
    }
  };

  const renderLoanDetails = () => (
    <Card>
      <CardHeader title="Loan / Advance Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {currentLoan && <Field.Text name="loanNo" label="Loan No" disabled />}

        <Field.Select name="borrowerType" label="Borrower Type">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {availableBorrowerTypes.map(({ key, label }) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Field.Select>

        <RHFFreeSoloAutocomplete
          name="loanReason"
          label="Loan Reason / Type"
          options={borrowerType ? LOAN_REASONS[borrowerType] || [] : []}
          placeholder="Select or enter reason"
        />

        <Box>
          <DialogSelectButton
            onClick={
              borrowerType === 'Driver'
                ? driverDialog.onTrue
                : borrowerType === 'Transporter'
                  ? transporterDialog.onTrue
                  : () => {}
            }
            disabled={!borrowerType}
            placeholder={
              !borrowerType
                ? 'Select Borrower Type first'
                : borrowerType === 'Driver'
                  ? 'Select Driver'
                  : 'Select Transporter'
            }
            selected={
              borrowerType === 'Driver'
                ? selectedDriver?.driverName
                : borrowerType === 'Transporter'
                  ? selectedTransporter?.transportName
                  : undefined
            }
            error={!!errors.borrowerId?.message}
            iconName={borrowerType === 'Transporter' ? 'mdi:truck-delivery' : 'mdi:account'}
          />
        </Box>

        <Field.Text
          name="principalAmount"
          label="Loan Amount"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
          }}
        />

        <Field.DatePicker name="disbursementDate" label="Issue Date" maxDate={dayjs()} />

        <Field.Text name="remarks" label="Remarks" multiline rows={4} />
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {currentLoan ? 'Update Loan' : 'Create Loan'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderLoanDetails()}
        {renderActions()}
      </Stack>

      {/* Selection dialogs */}
      <KanbanDriverDialog
        open={driverDialog.value}
        onClose={driverDialog.onFalse}
        selectedDriver={selectedDriver}
        onDriverChange={handleDriverChange}
        allowQuickCreate
      />

      <KanbanTransporterDialog
        open={transporterDialog.value}
        onClose={transporterDialog.onFalse}
        selectedTransporter={selectedTransporter}
        onTransporterChange={handleTransporterChange}
      />
    </Form>
  );
}
