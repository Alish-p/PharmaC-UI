import SignatureCanvas from 'react-signature-canvas';
import { useRef, forwardRef, useCallback, useImperativeHandle } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SignaturePad = forwardRef(
  ({ label = 'Draw your signature', error, helperText, sx, ...other }, ref) => {
    const sigRef = useRef(null);

    const handleClear = useCallback(() => {
      sigRef.current?.clear();
    }, []);

    const isEmpty = useCallback(() => sigRef.current?.isEmpty() ?? true, []);

    const toDataURL = useCallback((type = 'image/png') => {
      if (sigRef.current?.isEmpty()) return null;
      return sigRef.current?.toDataURL(type);
    }, []);

    const toBlob = useCallback(
      (type = 'image/png') =>
        new Promise((resolve) => {
          if (sigRef.current?.isEmpty()) {
            resolve(null);
            return;
          }
          const canvas = sigRef.current?.getCanvas();
          canvas?.toBlob((blob) => resolve(blob), type);
        }),
      []
    );

    useImperativeHandle(ref, () => ({
      clear: handleClear,
      isEmpty,
      toDataURL,
      toBlob,
    }));

    return (
      <Box sx={{ width: '100%', ...sx }} {...other}>
        {label && (
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: error ? 'error.main' : 'text.primary' }}
          >
            {label}
          </Typography>
        )}
        <Box
          sx={{
            border: 2,
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1.5,
            bgcolor: '#848484ff', // Forced white to keep contrast with dark pen
            overflow: 'hidden',
            position: 'relative',
            touchAction: 'none',
          }}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="#1a1a2e"
            clearOnResize={false}
            canvasProps={{
              style: {
                width: '100%',
                height: 220,
                cursor: 'crosshair',
              },
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button
            size="small"
            color="inherit"
            onClick={handleClear}
            startIcon={<Iconify icon="mdi:eraser-variant" />}
          >
            Clear
          </Button>
        </Stack>

        {helperText && (
          <Typography
            variant="caption"
            sx={{ color: error ? 'error.main' : 'text.secondary', mt: 0.5 }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export { SignaturePad };
