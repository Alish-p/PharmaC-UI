import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

// Validation schema for creating a tenant user (no permissions field)
const TenantUserSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Invalid email address!' }),
  mobile: schemaHelper.phoneNumber({
    message: {
      required_error: 'Mobile No is required',
      invalid_error: 'Mobile No must be exactly 10 digits',
    },
  }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  designation: zod.string().min(1, { message: 'Designation is required!' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long!' }),
});

export function TenantUserFormDialog({ open, onClose, onSubmit }) {
  const defaultValues = useMemo(
    () => ({
      name: '',
      email: '',
      mobile: '',
      address: '',
      designation: '',
      password: '',
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(TenantUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const submit = handleSubmit((data) => {
    // Do not include any permissions in payload
    onSubmit(data);
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Tenant User</DialogTitle>
      <Form methods={methods} onSubmit={submit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Field.Text name="name" label="Full name" />
            <Field.Text name="email" label="Email address" />
            <Field.Text
              name="mobile"
              label="Mobile number"
              InputProps={{
                startAdornment: <InputAdornment position="start">+91 - </InputAdornment>,
              }}
            />
            <Field.Text name="address" label="Address" />
            <Field.Text name="designation" label="Designation" />
            <Field.Text
              name="password"
              label="Password"
              helperText="Temporary password; user can change after login."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default TenantUserFormDialog;
