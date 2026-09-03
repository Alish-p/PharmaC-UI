import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Card,
  Stack,
  Paper,
  Alert,
  Button,
  Divider,
  Typography,
  LinearProgress,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFieldHelpers } from 'src/hooks/use-form-config';

import {
  useSubtrip,
  useUpdateSubtripReceiveInfo,
  getSubtripDocumentUploadUrl,
} from 'src/query/use-subtrip';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { getWeightUnit } from './utils';
import { SUBTRIP_STATUS } from './constants';
import { receiveSchema } from './subtrip-schemas';
import { BasicExpenseTable } from './widgets/basic-expense-table';
import { SubtripDetailCard } from './widgets/subtrip-detail-card';
import { KanbanSubtripDialog } from '../kanban/components/kanban-subtrip-dialog';
import { SubtripReceiveSettlementSummary } from './widgets/subtrip-receive-settlement-summary';

const defaultValues = {
  subtripId: '',
  endDate: new Date(),
  unloadingWeight: 0,
  commissionDetails: {
    commissionRate: 0,
    commissionAmount: 0,
  },
  freightDetails: {
    freightAmount: 0,
    endKm: '',
    endTime: null,
  },
  hasShortage: false,
  hasError: false,
  shortageWeight: 0,
  shortageAmount: 0,
  remarks: '',
  errorRemarks: '',
  docs: [],
};

const ReceiveFormFields = ({ selectedSubtrip, methods, errors, subtripDialog, isLoading }) => {
  const { watch, setValue } = methods;
  const {
    hasError,
    hasShortage,
    unloadingWeight,
    commissionDetails,
    freightDetails,
    endDate,
    shortageAmount,
    shortageWeight,
  } = watch();
  const { isOwn } = selectedSubtrip?.vehicleId || {};
  const freightModel = selectedSubtrip?.freightDetails?.freightModel || 'per_ton';

  const customerId = selectedSubtrip?.customerId?._id || selectedSubtrip?.customerId;
  const { getLabel, isRequired } = useFieldHelpers('subtrip', customerId);

  // Initialize default freight details when selectedSubtrip loads/changes
  useEffect(() => {
    if (selectedSubtrip && selectedSubtrip.freightDetails) {
      setValue(
        'freightDetails',
        {
          freightAmount: selectedSubtrip.freightDetails.freightAmount || 0,
          endKm:
            selectedSubtrip.freightDetails.endKm !== undefined &&
              selectedSubtrip.freightDetails.endKm !== null
              ? selectedSubtrip.freightDetails.endKm
              : undefined,
          endTime: selectedSubtrip.freightDetails.endTime || null,
        },
        { shouldValidate: true }
      );
    }
  }, [selectedSubtrip?._id, setValue, selectedSubtrip]);

  // Initialize default commission details when selectedSubtrip loads/changes
  useEffect(() => {
    if (selectedSubtrip && selectedSubtrip.commissionDetails) {
      setValue(
        'commissionDetails',
        {
          commissionRate: selectedSubtrip.commissionDetails.commissionRate || 0,
          commissionAmount: selectedSubtrip.commissionDetails.commissionAmount || 0,
        },
        { shouldValidate: true }
      );
    }
  }, [selectedSubtrip?._id, setValue, selectedSubtrip]);

  // Initialize helper context fields for zod dynamic schema validation
  useEffect(() => {
    if (selectedSubtrip) {
      setValue('freightModel', selectedSubtrip.freightDetails?.freightModel || 'per_ton');
      setValue('startKm', selectedSubtrip.freightDetails?.startKm || 0);
      setValue('loadingWeight', selectedSubtrip.loadingWeight || 0);
      setValue('isOwn', selectedSubtrip.vehicleId?.isOwn ?? true);
      setValue('unloadingWeightRequired', isRequired('unloadingWeight'));
      setValue('remarksRequired', isRequired('remarks'));
    }
  }, [selectedSubtrip, setValue, isRequired]);

  // Auto-calculate commission amount based on commissionRate and loadingWeight for per_ton / per_kl model
  useEffect(() => {
    if (!selectedSubtrip || isOwn || (freightModel !== 'per_ton' && freightModel !== 'per_kl'))
      return;

    const rate = Number(commissionDetails?.commissionRate || 0);
    const weight = Number(selectedSubtrip.loadingWeight || 0);
    setValue('commissionDetails.commissionAmount', rate * weight, { shouldValidate: true });
  }, [commissionDetails?.commissionRate, selectedSubtrip, freightModel, isOwn, setValue]);

  // Auto-calculate freight amount based on endKm / endDate / loadingWeight for specific models
  useEffect(() => {
    if (!selectedSubtrip) return;

    const rate = selectedSubtrip.freightDetails?.rate || 0;

    if (freightModel === 'per_km' && freightDetails?.endKm) {
      const startKm = selectedSubtrip.freightDetails?.startKm || 0;
      const endKm = Number(freightDetails.endKm);
      if (endKm > startKm) {
        setValue('freightDetails.freightAmount', (endKm - startKm) * rate, {
          shouldValidate: true,
        });
      }
    } else if (freightModel === 'hybrid' && freightDetails?.endKm) {
      const startKm = selectedSubtrip.freightDetails?.startKm || 0;
      const endKm = Number(freightDetails.endKm);
      const baseKm = selectedSubtrip.freightDetails?.baseKm || 0;
      const baseFreight = selectedSubtrip.freightDetails?.freightAmount || 0;
      const totalKm = endKm > startKm ? endKm - startKm : 0;

      if (totalKm > baseKm && rate > 0) {
        const extraKm = totalKm - baseKm;
        setValue('freightDetails.freightAmount', baseFreight + extraKm * rate, {
          shouldValidate: true,
        });
      }
    } else if (freightModel === 'per_hour' && endDate) {
      const startTime = selectedSubtrip.startDate;
      if (startTime) {
        const start = dayjs(startTime);
        const end = dayjs(endDate);
        const diffInHours = Math.ceil(end.diff(start, 'hour', true));
        if (diffInHours > 0) {
          setValue('freightDetails.freightAmount', diffInHours * rate, { shouldValidate: true });
        }
      }
    } else if (freightModel === 'per_ton' || freightModel === 'per_kl') {
      const weight = selectedSubtrip.loadingWeight || 0;
      setValue('freightDetails.freightAmount', weight * rate, { shouldValidate: true });
    }
  }, [freightDetails?.endKm, endDate, selectedSubtrip, freightModel, isOwn, setValue]);

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      const currentDocs = watch('docs') || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const totalFiles = [...currentDocs, ...newFiles];
      if (totalFiles.length > 5) {
        // We can just slice it to 5, or leave it to show the zod validation error
        setValue('docs', totalFiles.slice(0, 5), { shouldValidate: true });
      } else {
        setValue('docs', totalFiles, { shouldValidate: true });
      }
    },
    [setValue, watch]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const currentDocs = watch('docs') || [];
      const filtered = currentDocs.filter((file) => file !== inputFile);
      setValue('docs', filtered, { shouldValidate: true });
    },
    [setValue, watch]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('docs', [], { shouldValidate: true });
  }, [setValue]);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      {isLoading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
          <LinearProgress color="info" size={24} sx={{ mt: 1 }} />
        </Box>
      )}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon={APP_ICONS.job} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">Job Receive Details</Typography>
      </Stack>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
        <DialogSelectButton
          onClick={subtripDialog.onTrue}
          placeholder="Select Job *"
          selected={selectedSubtrip?.subtripNo}
          error={!!errors.subtripId?.message}
          iconName={APP_ICONS.job}
          sx={{ gridColumn: '1 / -1' }}
        />

        {selectedSubtrip && (
          <>
            <Field.Configurable entity="subtrip" name="unloadingWeight" customerId={customerId}>
              <Field.Text
                name="unloadingWeight"
                label={getLabel(
                  'unloadingWeight',
                  freightModel === 'per_kl' ? 'Unloading Volume (KL)' : 'Unloading Weight'
                )}
                type="number"
                required={
                  freightModel === 'per_ton' ||
                  freightModel === 'per_kl' ||
                  isRequired('unloadingWeight')
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {getWeightUnit(selectedSubtrip)}
                    </InputAdornment>
                  ),
                }}
              />
            </Field.Configurable>

            {isOwn ? null : freightModel === 'per_ton' || freightModel === 'per_kl' ? (
              <Field.Configurable entity="subtrip" name="commissionRate" customerId={customerId}>
                <Field.Text
                  name="commissionDetails.commissionRate"
                  label={getLabel('commissionRate', 'Transporter Commission Rate')}
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Iconify icon="mdi:currency-inr" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Field.Configurable>
            ) : (
              <Field.Configurable entity="subtrip" name="commissionAmount" customerId={customerId}>
                <Field.Text
                  name="commissionDetails.commissionAmount"
                  label={getLabel('commissionAmount', 'Transporter Commission Amount')}
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Iconify icon="mdi:currency-inr" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Field.Configurable>
            )}

            <Field.MobileDateTimePicker name="endDate" label="LR Receive Date *" />

            {(freightModel === 'per_km' || freightModel === 'hybrid') && (
              <Field.Configurable entity="subtrip" name="endKm" customerId={customerId}>
                <Field.Text
                  name="freightDetails.endKm"
                  label={getLabel('endKm', 'Billing End KM')}
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                />
              </Field.Configurable>
            )}

            <SubtripReceiveSettlementSummary
              selectedSubtrip={selectedSubtrip}
              freightDetails={freightDetails}
              commissionDetails={commissionDetails}
              hasShortage={hasShortage}
              shortageAmount={shortageAmount}
              shortageWeight={shortageWeight}
              endDate={endDate}
            />
          </>
        )}
      </Box>

      {selectedSubtrip && (
        <>
          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Field.Switch name="hasShortage" label="Has Shortage" color="warning" />
            <Field.Switch name="hasError" label="Has Error" color="error" />
          </Stack>

          {hasShortage && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Shortage Details
              </Typography>
              <Stack direction="row" spacing={2}>
                <Field.Configurable entity="subtrip" name="shortageWeight" customerId={customerId}>
                  <Field.Number
                    name="shortageWeight"
                    label={getLabel(
                      'shortageWeight',
                      freightModel === 'per_kl' ? 'Shortage Volume (KL)' : 'Shortage Weight'
                    )}
                    helperText=""
                    placeholder="0"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {getWeightUnit(selectedSubtrip)}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Field.Configurable>
                <Field.Configurable entity="subtrip" name="shortageAmount" customerId={customerId}>
                  <Field.Text
                    name="shortageAmount"
                    label={getLabel('shortageAmount', 'Shortage Amount')}
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Iconify icon="mdi:currency-inr" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Field.Configurable>
              </Stack>
            </Box>
          )}

          {hasError && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Error Details
              </Typography>
              <Field.Text
                name="errorRemarks"
                label="Error Remarks *"
                type="text"
                multiline
                rows={3}
              />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Documents (Optional)
            </Typography>
            <Field.Upload
              multiple
              name="docs"
              maxSize={3145728}
              accept={{ 'image/*': [], 'application/pdf': [] }}
              onDrop={handleDropMultiFile}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAllFiles}
            />
          </Box>
        </>
      )}

      <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
        {unloadingWeight > selectedSubtrip?.loadingWeight && (
          <Alert severity="error" variant="outlined">
            Unloading weight cannot be more than loading weight
          </Alert>
        )}
        {!isOwn &&
          (freightModel === 'per_ton' || freightModel === 'per_kl') &&
          commissionDetails?.commissionRate > selectedSubtrip?.freightDetails?.rate && (
            <Alert severity="error" variant="outlined">
              Commission rate cannot be more than the freight rate
            </Alert>
          )}
        {!isOwn &&
          freightModel !== 'per_ton' &&
          freightModel !== 'per_kl' &&
          commissionDetails?.commissionAmount > selectedSubtrip?.freightDetails?.freightAmount && (
            <Alert severity="error" variant="outlined">
              Commission amount cannot be more than the freight amount
            </Alert>
          )}
      </Stack>
    </Card>
  );
};

export function SubtripReceiveForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSubtripId = searchParams.get('currentSubtrip');
  const redirectTo = searchParams.get('redirectTo');

  const subtripDialog = useBoolean();
  const [selectedSubtripId, setSelectedSubtripId] = useState(() => currentSubtripId || null);

  const { data: selectedSubtripData, isLoading: isLoadingSelectedSubtrip } =
    useSubtrip(selectedSubtripId);

  const receiveSubtrip = useUpdateSubtripReceiveInfo();

  const methods = useForm({
    resolver: zodResolver(receiveSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { unloadingWeight, commissionDetails } = watch();
  const { isOwn } = selectedSubtripData?.vehicleId || {};
  const handleSubtripChange = useCallback(
    (subtrip) => {
      setSelectedSubtripId(subtrip._id);

      reset({
        ...defaultValues,
        subtripId: subtrip._id,
      });
    },
    [reset]
  );

  const onSubmit = async (data) => {
    try {
      let uploadedDocs = [];
      if (data.docs && data.docs.length > 0) {
        uploadedDocs = await Promise.all(
          data.docs.map(async (file) => {
            if (typeof file === 'string') return file;
            const fileExtension = file.name.split('.').pop() || 'pdf';
            const contentType = file.type || 'application/pdf';
            const resUrl = await getSubtripDocumentUploadUrl({ contentType, fileExtension });
            const res = await fetch(resUrl.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': contentType },
              body: file,
            });
            if (!res.ok) throw new Error('Upload failed');
            return resUrl.publicUrl;
          })
        );
      }

      const submissionData = { ...data, docs: uploadedDocs };

      await receiveSubtrip({ id: selectedSubtripData._id, data: submissionData });
      reset(defaultValues);
      setSelectedSubtripId(null);
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  // effects to fetch data
  useEffect(() => {
    if (currentSubtripId) {
      handleSubtripChange({ _id: currentSubtripId });
    }
  }, [currentSubtripId, handleSubtripChange]);

  // Removed endKm auto-fill via GPS as endKm is no longer captured

  return (
    <>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={5}>
            <ReceiveFormFields
              selectedSubtrip={selectedSubtripData}
              methods={methods}
              errors={errors}
              subtripDialog={subtripDialog}
              isLoading={isLoadingSelectedSubtrip}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  reset(defaultValues);
                  setSelectedSubtripId(null);
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={
                  !isValid ||
                  isSubmitting ||
                  // local errors
                  unloadingWeight > selectedSubtripData?.loadingWeight ||
                  (!isOwn &&
                    (selectedSubtripData?.freightDetails?.freightModel === 'per_ton' ||
                      selectedSubtripData?.freightDetails?.freightModel === 'per_kl') &&
                    commissionDetails?.commissionRate >
                    selectedSubtripData?.freightDetails?.rate) ||
                  (!isOwn &&
                    selectedSubtripData?.freightDetails?.freightModel !== 'per_ton' &&
                    selectedSubtripData?.freightDetails?.freightModel !== 'per_kl' &&
                    commissionDetails?.commissionAmount >
                    selectedSubtripData?.freightDetails?.freightAmount)
                }
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={7}>
            {selectedSubtripData ? (
              <Stack spacing={2}>
                <SubtripDetailCard
                  selectedSubtrip={selectedSubtripData}
                  commissionRate={watch('commissionDetails.commissionRate')}
                  commissionAmount={watch('commissionDetails.commissionAmount')}
                />
                <BasicExpenseTable selectedSubtrip={selectedSubtripData} />
              </Stack>
            ) : (
              <Paper
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 300,
                  bgcolor: 'background.neutral',
                }}
              >
                <Iconify
                  icon="mdi:truck-fast-outline"
                  sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Select a job to view details
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, textAlign: 'center' }}
                >
                  Choose a job from the form to see its details and expenses
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Form>

      <KanbanSubtripDialog
        open={subtripDialog.value}
        onClose={subtripDialog.onFalse}
        selectedSubtrip={selectedSubtripData}
        onSubtripChange={handleSubtripChange}
        statusList={[SUBTRIP_STATUS.LOADED]}
        dialogTitle="Select Job to Receive"
      />
    </>
  );
}
