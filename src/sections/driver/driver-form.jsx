import { z as zod } from 'zod';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Divider,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';

// routes
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  useUpdateDriver,
  useCreateFullDriver,
  getDriverPhotoUploadUrl,
} from 'src/query/use-driver';

// components
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';

// ----------------------------------------------------------------------

export const NewDriverSchema = zod.object({
  driverName: zod
    .string()
    .min(3, { message: 'Driver Name is required and must have at least 3 characters' })
    .regex(/^[^0-9]*$/, { message: 'Driver Name must not contain numbers' }),
  photoImage: zod.any().nullable(),
  driverLicenceNo: zod
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z]{2}[0-9]{13}$/.test(val), {
      message: 'Driver Licence No must be in the format: two letters followed by 13 digits',
    }),
  driverPresentAddress: zod.string().optional(),
  driverCellNo: schemaHelper.phoneNumber({
    message: {
      required_error: 'Driver Cell No is required',
      invalid_error: 'Driver Cell No must be exactly 10 digits',
    },
  }),
  licenseFrom: schemaHelper.dateOptional(),
  licenseTo: schemaHelper.dateOptional(),
  aadharNo: zod
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /(^[0-9]{4}[0-9]{4}[0-9]{4}$)|(^[0-9]{4}\s[0-9]{4}\s[0-9]{4}$)|(^[0-9]{4}-[0-9]{4}-[0-9]{4}$)/.test(
          val
        ),
      { message: 'Aadhar No must be a valid format ie (12 Digits)' }
    ),
  guarantorName: zod.string().optional(),
  guarantorCellNo: zod.string().optional(),
  experience: zod
    .number()
    .min(0, { message: 'Experience must be at least 0 years' })
    .optional()
    .nullable(),
  dob: schemaHelper.dateOptional(),
  permanentAddress: zod.string().optional(),
  isActive: zod.boolean().optional(),
  type: zod.string().min(1, { message: 'Driver Type is required' }),
  bankDetails: zod
    .object({
      name: zod.string().optional(),
      branch: zod.string().optional(),
      ifsc: zod.string().optional(),
      place: zod.string().optional(),
      accNo: zod.string().optional(),
    })
    .optional(),
});

// ----------------------------------------------------------------------

export default function DriverForm({ currentDriver }) {
  const navigate = useNavigate();
  const bankDialog = useBoolean();
  const createDriver = useCreateFullDriver();
  const updateDriver = useUpdateDriver();

  const defaultValues = useMemo(
    () => ({
      driverName: currentDriver?.driverName || '',
      photoImage: currentDriver?.photoImage || null,
      driverLicenceNo: currentDriver?.driverLicenceNo || '',
      driverPresentAddress: currentDriver?.driverPresentAddress || '',
      driverCellNo: currentDriver?.driverCellNo || '',
      licenseFrom: currentDriver?.licenseFrom ? new Date(currentDriver.licenseFrom) : null,
      licenseTo: currentDriver?.licenseTo ? new Date(currentDriver.licenseTo) : null,
      aadharNo: currentDriver?.aadharNo || '',
      guarantorName: currentDriver?.guarantorName || '',
      guarantorCellNo: currentDriver?.guarantorCellNo || '',
      experience: currentDriver?.experience || 0,
      dob: currentDriver?.dob ? new Date(currentDriver.dob) : undefined,
      permanentAddress: currentDriver?.permanentAddress || '',
      isActive: currentDriver?.isActive ?? true,
      type: currentDriver?.type || 'Market',
      bankDetails: {
        name: currentDriver?.bankDetails?.name || '',
        ifsc: currentDriver?.bankDetails?.ifsc || '',
        place: currentDriver?.bankDetails?.place || '',
        branch: currentDriver?.bankDetails?.branch || '',
        accNo: currentDriver?.bankDetails?.accNo || '',
      },
    }),
    [currentDriver]
  );

  const methods = useForm({
    resolver: zodResolver(NewDriverSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const handleUploadPhoto = async (file) => {
    try {
      const isFile = file instanceof File;
      if (!isFile) return file;

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const contentType = file.type || 'image/jpeg';

      const { uploadUrl, publicUrl } = await getDriverPhotoUploadUrl({
        contentType,
        fileExtension,
      });

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });

      if (!res.ok) throw new Error('Upload failed');

      return publicUrl;
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload driver photo');
      throw err;
    }
  };

  const onSubmit = async (data) => {
    try {
      const { photoImage, ...restData } = data;
      const uploadedPhotoUrl =
        photoImage instanceof File ? await handleUploadPhoto(photoImage) : photoImage;

      const sanitized = sanitizeDriverBeforeSubmit({ ...restData, photoImage: uploadedPhotoUrl });
      if (!currentDriver) {
        await createDriver(sanitized);
      } else {
        console.log({ dataInOnSubmit: sanitized });
        await updateDriver({ id: currentDriver._id, data: sanitized });
      }
      reset();
      navigate(paths.dashboard.driver.list);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(
          'photoImage',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
          { shouldValidate: true }
        );
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('photoImage', null, { shouldValidate: true });
  }, [setValue]);

  const renderDriverDetails = () => (
    <>
      <Typography variant="h6" gutterBottom>
        Driver Details
      </Typography>
      <Card sx={{ p: 3, mb: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={3}
        >
          <Field.Text required name="driverName" label="Driver Name" />
          <Field.Text
            required
            name="driverCellNo"
            label="Driver Cell No"
            InputProps={{
              startAdornment: <InputAdornment position="start">+91 - </InputAdornment>,
            }}
          />
          <Field.Select required name="type" label="Driver Type">
            {['Own', 'Market'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Field.Select>
          <Field.Text name="driverLicenceNo" label="Driver Licence No" />
          <Field.Text name="driverPresentAddress" label="Present Address" />
          <Field.Text name="permanentAddress" label="Permanent Address" />

          <Field.Text name="aadharNo" label="Aadhar No" />
          <Field.Text
            name="experience"
            label="Experience"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">years</InputAdornment>,
            }}
          />

          <Field.Text name="guarantorName" label="Guarantor Name" />
          <Field.Text
            name="guarantorCellNo"
            label="Guarantor Cell No"
            InputProps={{
              startAdornment: <InputAdornment position="start">+91 - </InputAdornment>,
            }}
          />

          <Field.DatePicker name="dob" label="Date of Birth" disableFuture />

          <Field.DatePicker name="licenseFrom" label="License From" disableFuture />
          <Field.DatePicker name="licenseTo" label="License To" />
        </Box>
      </Card>
    </>
  );

  const renderBankDetails = () => {
    const bd = values?.bankDetails || {};
    const summary = bd?.name
      ? `${bd.name}${bd.branch ? ` • ${bd.branch}` : ''}${bd.place ? ` • ${bd.place}` : ''}${bd.accNo ? ` • A/C ${bd.accNo}` : ''}`
      : 'Add bank details';
    const hasError = Boolean(errors?.bankDetails);

    return (
      <>
        <Typography variant="h6" gutterBottom>
          Bank Details
        </Typography>
        <Card sx={{ p: 3, mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={bankDialog.onTrue}
            startIcon={<Iconify icon={bd?.name ? 'mdi:bank' : 'mdi:bank-outline'} />}
            sx={{
              height: 56,
              justifyContent: 'flex-start',
              typography: 'body2',
              borderColor: hasError ? 'error.main' : 'text.disabled',
              color: hasError ? 'error.main' : 'text.primary',
            }}
          >
            {summary}
          </Button>

          <BankDetailsWidget
            variant="dialog"
            title="Bank Details"
            open={bankDialog.value}
            onClose={bankDialog.onFalse}
            fieldNames={{
              ifsc: 'bankDetails.ifsc',
              name: 'bankDetails.name',
              branch: 'bankDetails.branch',
              place: 'bankDetails.place',
              accNo: 'bankDetails.accNo',
            }}
          />
        </Card>
      </>
    );
  };

  const renderImages = () => (
    <Card sx={{ pt: 10, mt: 4, pb: 5, px: 3 }}>
      {currentDriver && (
        <Label
          color={values.isActive ? 'success' : 'error'}
          sx={{ position: 'absolute', top: 24, right: 24, cursor: 'pointer' }}
          onClick={() => setValue('isActive', !values.isActive, { shouldValidate: true })}
        >
          {values.isActive ? 'Active' : 'Disabled'}
        </Label>
      )}

      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Photo
        </Typography>

        <Field.Upload
          name="photoImage"
          maxSize={3145728}
          onDrop={handleDrop}
          onDelete={handleRemoveFile}
        />
      </Box>
    </Card>
  );

  const renderActions = () => (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentDriver ? 'Create Driver' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  const renderDialogues = () => null; // Bank list dialog removed

  return (
    <>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {renderImages()}
          </Grid>
          <Grid item xs={12} md={8}>
            {renderDriverDetails()}
            {renderBankDetails()}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {renderActions()}
        {renderDialogues()}
      </Form>

      {/* Bank selection dialog removed in favor of inline bank details widget */}
    </>
  );
}

// Strip empty strings in bankDetails to undefined
function sanitizeDriverBeforeSubmit(data) {
  const out = { ...data };
  const bd = out?.bankDetails;
  if (bd && typeof bd === 'object') {
    const cleaned = { ...bd };
    ['name', 'branch', 'ifsc', 'place', 'accNo'].forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = undefined;
    });
    out.bankDetails = cleaned;
  }
  return out;
}
