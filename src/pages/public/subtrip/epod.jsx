import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams } from 'src/routes/hooks';

import axios from 'src/utils/axios';

import { usePublicSubtrip } from 'src/query/use-subtrip';

import { Iconify } from 'src/components/iconify';
import { SignaturePad } from 'src/components/signature-pad';

// -----------------------------------------------------------------------

const PUBLIC_ENDPOINT = '/api/public/subtrips';

export default function PublicEpodPage() {
  const { id } = useParams();
  const { data: subtrip, isLoading } = usePublicSubtrip(id);

  const sigPadRef = useRef(null);
  const [signerName, setSignerName] = useState('');
  const [signerMobile, setSignerMobile] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [geoLocation, setGeoLocation] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('Received');
  const [evidenceImages, setEvidenceImages] = useState([]);

  const handleImageChange = useCallback((e) => {
    if (e.target.files) {
      setEvidenceImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
    // Reset the input value so the same file can be selected again if it was removed
    e.target.value = null;
  }, []);

  const removeImage = useCallback((indexToRemove) => {
    setEvidenceImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  // Capture GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setGeoLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => {
          // Geo denied — continue without it
        }
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!signerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!signerMobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (sigPadRef.current?.isEmpty()) {
      setError('Please draw your signature');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload evidence images to S3
      const uploadPromises = evidenceImages.map(async (file) => {
        const ext = file.name.split('.').pop() || 'png';
        const type = file.type || 'image/png';
        const { data: uploadData } = await axios.get(`${PUBLIC_ENDPOINT}/${id}/epod/upload-url`, {
          params: { contentType: type, fileExtension: ext },
        });

        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': type },
          body: file,
        });

        return uploadData.publicUrl;
      });

      const uploadedImageUrls = await Promise.all(uploadPromises);

      // 2. Get pre-signed S3 URL for signature
      const { data: uploadData } = await axios.get(`${PUBLIC_ENDPOINT}/${id}/epod/upload-url`, {
        params: { contentType: 'image/png', fileExtension: 'png' },
      });

      // 3. Upload signature image to S3
      const blob = await sigPadRef.current.toBlob('image/png');
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: blob,
      });

      // 4. Submit EPOD metadata
      await axios.post(`${PUBLIC_ENDPOINT}/${id}/epod`, {
        podSignature: uploadData.publicUrl,
        podSignedBy: signerName.trim(),
        podSigneeMobile: signerMobile.trim(),
        podRemarks: `[${deliveryStatus}] ${remarks.trim()}`.trim() || deliveryStatus,
        podGeoLocation: geoLocation || undefined,
        podImages: uploadedImageUrls,
      });

      setSubmitted(true);
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [id, signerName, signerMobile, remarks, geoLocation, deliveryStatus, evidenceImages]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not found
  if (!subtrip) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
          <Iconify icon="mdi:file-alert-outline" width={56} sx={{ color: 'warning.main' }} />
          <Typography variant="h5">Job Not Found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The link may be invalid or expired. Please contact the transporter.
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Already signed
  if (subtrip.podSignature) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', maxWidth: 480 }}>
          <Iconify icon="mdi:check-circle" width={64} sx={{ color: 'success.main' }} />
          <Typography variant="h5">Already Signed</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This delivery has already been signed by <strong>{subtrip.podSignedBy}</strong>
            {subtrip.podSigneeMobile ? ` (${subtrip.podSigneeMobile})` : ''} on{' '}
            {new Date(subtrip.podSignedAt).toLocaleString()}.
          </Typography>
          <Box
            component="img"
            src={subtrip.podSignature}
            alt="Signature"
            sx={{
              maxWidth: 300,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: '#fff',
              mt: 1,
            }}
          />

          {subtrip.podImages?.length > 0 && (
            <Stack spacing={1} sx={{ mt: 2, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ textAlign: 'left', color: 'text.secondary' }}>
                Evidence Images
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subtrip.podImages.map((imgUrl, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={imgUrl}
                    alt="evidence"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ))}
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>
    );
  }

  // Success state after submission
  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', maxWidth: 480 }}>
          <Iconify icon="mdi:check-circle" width={64} sx={{ color: 'success.main' }} />
          <Typography variant="h5">Proof of Delivery Submitted</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Thank you! Your signature has been recorded for Job #{subtrip.subtripNo}. You can close
            this page now.
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Main EPOD form
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
        py: 3,
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="mdi:truck-check" width={32} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">Electronic Proof of Delivery</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Job #{subtrip.subtripNo}
            </Typography>
          </Box>
        </Stack>

        {/* Job Summary Card */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                LR Number
              </Typography>
              <Chip label={subtrip.subtripNo} size="small" color="primary" variant="soft" />
            </Stack>
            <Divider />
            {subtrip.customerId?.customerName && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Customer
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.customerId.customerName}
                </Typography>
              </Stack>
            )}
            {subtrip.consignee && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Consignee
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.consignee}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Route
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {subtrip.loadingPoint} → {subtrip.unloadingPoint}
              </Typography>
            </Stack>
            {subtrip.materialType && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Material
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.materialType}
                </Typography>
              </Stack>
            )}
            {subtrip.vehicleId?.vehicleNo && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Vehicle
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.vehicleId.vehicleNo}
                </Typography>
              </Stack>
            )}
            {subtrip.grade && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Grade
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.grade}
                </Typography>
              </Stack>
            )}
            {subtrip.quantity && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Quantity
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subtrip.quantity}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Signature Section */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Your Name *"
              placeholder="Enter your full name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              error={error === 'Please enter your name'}
              helperText={error === 'Please enter your name' ? error : ''}
            />

            <TextField
              fullWidth
              label="Mobile Number *"
              placeholder="Enter your mobile number"
              value={signerMobile}
              onChange={(e) => setSignerMobile(e.target.value)}
              error={error === 'Please enter your mobile number'}
              helperText={error === 'Please enter your mobile number' ? error : ''}
              type="tel"
            />

            <SignaturePad
              ref={sigPadRef}
              label="Sign Below *"
              error={error === 'Please draw your signature'}
              helperText={
                error === 'Please draw your signature' ? error : 'Use your finger or stylus to sign'
              }
            />

            <TextField
              select
              fullWidth
              label="Delivery Status *"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              <MenuItem value="Received">Received</MenuItem>
              <MenuItem value="Received with Damage">Received with Damage</MenuItem>
              <MenuItem value="Received with Shortage">Received with Shortage</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Remarks (Optional)"
              placeholder="Any delivery notes..."
              multiline
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Evidence Images (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {evidenceImages.map((file, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      position: 'relative',
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                    />
                    <Box
                      onClick={() => removeImage(idx)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                      }}
                    >
                      <Iconify icon="mdi:close" width={16} />
                    </Box>
                  </Box>
                ))}

                <Box
                  component="label"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Iconify
                    icon="mdi:camera-plus"
                    width={24}
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                    Add Photo
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </Box>
              </Box>
            </Stack>

            {geoLocation && (
              <Alert severity="info" icon={<Iconify icon="mdi:map-marker" />} variant="outlined">
                Location captured: {geoLocation.latitude.toFixed(4)},{' '}
                {geoLocation.longitude.toFixed(4)}
              </Alert>
            )}

            {error &&
              error !== 'Please enter your name' &&
              error !== 'Please enter your mobile number' &&
              error !== 'Please draw your signature' && (
                <Alert severity="error" variant="outlined">
                  {error}
                </Alert>
              )}
          </Stack>
        </Card>

        {/* Submit Button */}
        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          loading={submitting}
          onClick={handleSubmit}
          startIcon={<Iconify icon="mdi:check-bold" />}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          Submit Proof of Delivery
        </LoadingButton>

        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
          By signing, you confirm receipt of the consignment as described above.
        </Typography>
      </Stack>
    </Box>
  );
}
