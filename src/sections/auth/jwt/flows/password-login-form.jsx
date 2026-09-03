import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { signInWithPassword } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email or Mobile Number is required!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

/**
 * Handles email/password login.
 *
 * @param {object} props
 * @param {() => void} props.onSuccess - Called after successful login.
 * @param {(error: unknown) => void} props.onError - Called when login fails.
 */
export function PasswordLoginForm({ onSuccess, onError }) {
  const password = useBoolean();

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      onSuccess();
    } catch (error) {
      onError?.(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Field.Text name="email" label="Email or Mobile Number" InputLabelProps={{ shrink: true }} />

        <Stack spacing={1.5}>
          <Link
            component={RouterLink}
            href={paths.authDemo.split.resetPassword}
            variant="body2"
            color="inherit"
            sx={{ alignSelf: 'flex-end' }}
          >
            Forgot password?
          </Link>

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
        </Stack>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator="Login..."
        >
          Login
        </LoadingButton>
      </Stack>
    </Form>
  );
}
