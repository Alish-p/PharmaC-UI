import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { signUp } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export const SignUpSchema = zod.object({
  name: zod.string().min(1, { message: 'Full name is required!' }),
  pharmacyName: zod.string().min(2, { message: 'Pharmacy name is required!' }),
  mobile: zod.string().min(10, { message: 'Enter a valid 10-digit mobile number' }),
  dlNumber: zod.string().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const { checkUserSession } = useAuthContext();

  const router = useRouter();

  const password = useBoolean();

  const [errorMsg, setErrorMsg] = useState('');

  const defaultValues = {
    name: '',
    pharmacyName: '',
    email: '',
    mobile: '',
    dlNumber: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        name: data.name,
        pharmacyName: data.pharmacyName,
        email: data.email,
        mobile: data.mobile,
        dlNumber: data.dlNumber || '',
        password: data.password,
      });
      await checkUserSession?.();

      router.push(paths.dashboard.root);
    } catch (error) {
      console.error(error);
      let message = 'An error occurred during registration';
      if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        ({ message } = error);
      }
      setErrorMsg(message);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 4 }}>
      <Typography variant="h4">Register Your Pharmacy</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Setup your pharmacy store, inventory, and point-of-sale in minutes.
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Already have an account?
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2" color="primary.main">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Field.Text name="name" label="Pharmacist / Owner Name" placeholder="e.g. John Doe" InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="pharmacyName"
        label="Pharmacy Store Name"
        placeholder="e.g. Apollo Health Care"
        InputLabelProps={{ shrink: true }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text name="email" label="Email address" placeholder="admin@pharmacy.com" InputLabelProps={{ shrink: true }} />
        <Field.Text name="mobile" label="Mobile Number" placeholder="9876543210" InputLabelProps={{ shrink: true }} />
      </Stack>

      <Field.Text
        name="dlNumber"
        label="Drug License Number (DL No.)"
        placeholder="e.g. 20B/21B-KA-12345"
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Creating Pharmacy Account..."
        sx={{ mt: 2 }}
      >
        Get Started with PharmaC
      </LoadingButton>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 3,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'By creating a store, you agree to the '}
      <Link underline="always" color="text.primary">
        Terms of service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy policy
      </Link>
      .
    </Typography>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      {renderTerms}
    </>
  );
}
