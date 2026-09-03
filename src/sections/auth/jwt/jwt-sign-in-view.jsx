import { useState } from 'react';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify, SocialIcon } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { parseErrorMessage } from './utils/parse-error-message';
import { PasswordLoginForm } from './flows/password-login-form';
import { WhatsAppLoginForm } from './flows/whats-app-login-form';

// ----------------------------------------------------------------------

const LOGIN_METHODS = /** @type {const} */ ({
  PASSWORD: 'password',
  WHATSAPP: 'whatsapp',
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PASSWORD);
  const [errorMsg, setErrorMsg] = useState('');

  const isWhatsApp = loginMethod === LOGIN_METHODS.WHATSAPP;

  const switchTo = (method) => {
    setLoginMethod(method);
    setErrorMsg('');
  };

  const handleLoginSuccess = async () => {
    try {
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      setErrorMsg(parseErrorMessage(error));
    }
  };

  const handleError = (error) => {
    console.error(error);
    setErrorMsg(parseErrorMessage(error));
  };

  return (
    <>
      {/* Header */}
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">
          {isWhatsApp ? 'Login with WhatsApp OTP' : 'Login to your account'}
        </Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {`Don't have an account?`}
          </Typography>
          <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
            Get started
          </Link>
        </Stack>
      </Stack>

      {/* Error banner */}
      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Active login flow */}
      {isWhatsApp ? (
        <WhatsAppLoginForm onSuccess={handleLoginSuccess} onError={handleError} />
      ) : (
        <PasswordLoginForm onSuccess={handleLoginSuccess} onError={handleError} />
      )}

      <Divider
        sx={{
          my: 3,
          typography: 'overline',
          color: 'text.disabled',
          '&::before, :after': { borderTopStyle: 'dashed' },
        }}
      >
        OR
      </Divider>

      {/* Alternative login method switcher */}
      <Stack direction="row" justifyContent="center" spacing={1.5}>
        <IconButton
          onClick={() => switchTo(isWhatsApp ? LOGIN_METHODS.PASSWORD : LOGIN_METHODS.WHATSAPP)}
          title={isWhatsApp ? 'Login with Password' : 'Login with WhatsApp OTP'}
          sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          {isWhatsApp ? (
            <Iconify icon="mdi:key-variant" width={22} sx={{ color: 'text.secondary' }} />
          ) : (
            <Iconify icon="logos:whatsapp-icon" width={22} />
          )}
        </IconButton>

        <IconButton sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <SocialIcon icon="google" width={22} />
        </IconButton>
      </Stack>

      {/* Transporter Portal Link */}
      {import.meta.env.VITE_PORTAL_URL && (
        <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you a transporter?
          </Typography>
          <Link
            href={import.meta.env.VITE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="subtitle2"
          >
            Login here →
          </Link>
        </Stack>
      )}
    </>
  );
}
