/* eslint-disable prefer-destructuring */
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, useEffect, useCallback } from 'react';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form, Field } from 'src/components/hook-form';

import { verifyWhatsAppOTP, requestWhatsAppOTP } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const WhatsAppSignInSchema = zod.object({
  mobile: zod
    .string()
    .min(1, { message: 'Mobile number is required!' })
    .regex(/^\d{10}$/, { message: 'Enter a valid 10-digit mobile number' }),
  code: zod.string().optional(),
});

// ----------------------------------------------------------------------

/** Countdown timer hook — starts from `seconds` and ticks down to 0. */
function useOtpCountdown() {
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback((seconds = 60) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { countdown, start };
}

// ----------------------------------------------------------------------

/**
 * Handles WhatsApp OTP login (send OTP → verify OTP).
 *
 * @param {object} props
 * @param {() => void} props.onSuccess - Called after successful verification.
 * @param {(error: unknown) => void} props.onError - Called when any step fails.
 */
export function WhatsAppLoginForm({ onSuccess, onError }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { countdown, start: startCountdown } = useOtpCountdown();

  const methods = useForm({
    resolver: zodResolver(WhatsAppSignInSchema),
    defaultValues: { mobile: '', code: '' },
  });

  const { handleSubmit, getValues, setValue, setError, formState: { isSubmitting } } = methods;

  // ---- OTP request helpers ------------------------------------------------

  const sendOtp = async (mobile) => {
    setIsSendingOtp(true);
    try {
      // Prepend country code — users only enter the 10-digit number in the field
      await requestWhatsAppOTP({ mobile: `91${mobile}` });
      setOtpSent(true);
      setOtpMobile(mobile);
      startCountdown();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendOtp = async () => {
    const mobile = getValues('mobile');
    if (!mobile || mobile.length !== 10) {
      setError('mobile', { type: 'manual', message: 'Enter a valid 10-digit mobile number' });
      return;
    }
    await sendOtp(mobile);
  };

  const handleResendOtp = () => sendOtp(otpMobile);

  const handleChangeNumber = () => {
    setOtpSent(false);
    setValue('code', '');
  };

  // ---- Form submit --------------------------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    if (!otpSent) {
      await handleSendOtp();
      return;
    }
    if (!data.code || data.code.length !== 6) {
      setError('code', { type: 'manual', message: '6-digit OTP code is required!' });
      return;
    }
    try {
      await verifyWhatsAppOTP({ mobile: otpMobile, code: data.code });
      onSuccess();
    } catch (error) {
      onError?.(error);
    }
  });

  // ---- Render -------------------------------------------------------------

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {!otpSent ? (
          /* Step 1 — Enter mobile number */
          <>
            <Field.Text
              name="mobile"
              label="Mobile Number"
              placeholder="98765 43210"
              type="tel"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 600, userSelect: 'none', mr: 0.5 }}
                  >
                    +91
                  </Typography>
                ),
              }}
              inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) => {
                // Strip non-digits and cap at 10 — update via RHF so the controlled input re-renders
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                setValue('mobile', digitsOnly, { shouldValidate: false });
              }}
            />

            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              type="button"
              variant="contained"
              loading={isSendingOtp}
              onClick={handleSendOtp}
            >
              Send Verification Code
            </LoadingButton>
          </>
        ) : (
          /* Step 2 — Enter OTP */
          <>
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                We sent a 6-digit code to <strong>{otpMobile}</strong> via WhatsApp.
              </Typography>
              <Link component="button" type="button" variant="subtitle2" onClick={handleChangeNumber}>
                Change number
              </Link>
            </Stack>

            <Field.Code name="code" />

            <LoadingButton
              fullWidth
              color="inherit"
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Verify &amp; Login
            </LoadingButton>

            <Stack direction="row" justifyContent="center" spacing={0.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Didn&apos;t receive the code?
              </Typography>
              {countdown > 0 ? (
                <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                  Resend in {countdown}s
                </Typography>
              ) : (
                <Link component="button" type="button" variant="subtitle2" onClick={handleResendOtp}>
                  Resend code
                </Link>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Form>
  );
}
