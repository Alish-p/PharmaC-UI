import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useResponsive } from 'src/hooks/use-responsive';

import { Iconify } from 'src/components/iconify';

export default function CameraViewfinder({ onCapture, onCancel }) {
  const isMobile = useResponsive('down', 'sm');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [countdown, setCountdown] = useState(null);

  // Stop active media tracks safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error(e);
        }
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  // Start video stream
  const startCamera = useCallback(
    async (deviceIdOrFacing) => {
      stopStream();
      setLoading(true);
      setCameraError('');

      try {
        const constraints = {
          video:
            typeof deviceIdOrFacing === 'string' && deviceIdOrFacing.length > 20
              ? { deviceId: { exact: deviceIdOrFacing }, width: { ideal: 1920 }, height: { ideal: 1080 } }
              : { facingMode: deviceIdOrFacing || facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Get available video inputs for switching
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);

        const currentTrack = mediaStream.getVideoTracks()[0];
        const currentSettings = currentTrack?.getSettings();
        if (currentSettings?.deviceId) {
          setSelectedDeviceId(currentSettings.deviceId);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission denied. Please allow camera access in your browser settings, or upload an image file instead.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. Please connect a webcam or upload an image file.');
        } else {
          setCameraError(err.message || 'Unable to access camera.');
        }
      } finally {
        setLoading(false);
      }
    },
    [facingMode, stopStream]
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.error(e);
          }
        });
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeviceChange = (e) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `prescription_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          stopStream();
          onCapture({ file, previewUrl, base64: canvas.toDataURL('image/jpeg', 0.92) });
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleCaptureWithTimer = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          captureFrame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Video Element */}
      <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: 320, sm: 440 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <Stack spacing={1.5} alignItems="center" sx={{ color: 'white' }}>
            <CircularProgress color="inherit" />
            <Typography variant="caption">Activating camera...</Typography>
          </Stack>
        )}

        {cameraError ? (
          <Box sx={{ p: 3, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
            <Button variant="outlined" color="inherit" onClick={() => startCamera(facingMode)} sx={{ color: 'white', borderColor: 'white' }}>
              Retry Camera
            </Button>
          </Box>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              maxHeight: 520,
              objectFit: 'contain',
              display: loading ? 'none' : 'block',
            }}
          />
        )}

        {/* Prescription Alignment Overlay Guide */}
        {!loading && !cameraError && (
          <Box
            sx={{
              position: 'absolute',
              top: '8%',
              bottom: '15%',
              left: '8%',
              right: '8%',
              border: '2px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              Align Prescription within border
            </Typography>
            <Typography variant="caption" align="right" sx={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              Hold camera steady
            </Typography>
          </Box>
        )}

        {/* Countdown Indicator */}
        {countdown && (
          <Box
            sx={{
              position: 'absolute',
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'common.white',
              fontSize: 48,
              fontWeight: 'bold',
            }}
          >
            {countdown}
          </Box>
        )}
      </Box>

      {/* Camera Controls Bar */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          color: 'common.white',
        }}
      >
        {isMobile ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-around"
            sx={{ width: '100%', py: 0.5 }}
          >
            <IconButton
              size="medium"
              onClick={handleCaptureWithTimer}
              disabled={loading || !!cameraError}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.12)' }}
              title="3s Timer"
            >
              <Iconify icon="solar:clock-circle-bold" width={24} />
            </IconButton>

            {/* Big Circular Native Shutter Button */}
            <IconButton
              onClick={captureFrame}
              disabled={loading || !!cameraError}
              sx={{
                width: 68,
                height: 68,
                bgcolor: 'error.main',
                color: 'white',
                border: '4px solid rgba(255,255,255,0.85)',
                boxShadow: '0 0 20px rgba(255, 76, 76, 0.6)',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <Iconify icon="solar:camera-bold" width={32} />
            </IconButton>

            <IconButton
              size="medium"
              onClick={handleFlipCamera}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.12)' }}
              title="Flip Camera"
            >
              <Iconify icon="solar:camera-rotate-bold" width={24} />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              {devices.length > 1 && (
                <Select
                  size="small"
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiSelect-icon': { color: 'white' },
                    fontSize: 12,
                    maxWidth: 160,
                  }}
                >
                  {devices.map((d, idx) => (
                    <MenuItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${idx + 1}`}
                    </MenuItem>
                  ))}
                </Select>
              )}

              <IconButton
                size="small"
                onClick={handleFlipCamera}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                title="Flip Camera"
              >
                <Iconify icon="solar:camera-rotate-bold" />
              </IconButton>
            </Stack>

            {/* Main Capture Button */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                size="small"
                onClick={handleCaptureWithTimer}
                disabled={loading || !!cameraError}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                title="3s Timer"
              >
                <Iconify icon="solar:clock-circle-bold" />
              </IconButton>

              <Button
                variant="contained"
                color="error"
                size="large"
                disabled={loading || !!cameraError}
                onClick={captureFrame}
                startIcon={<Iconify icon="solar:camera-bold" />}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(255, 76, 76, 0.4)',
                }}
              >
                Snap Photo
              </Button>
            </Stack>

            <Button color="inherit" size="small" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
