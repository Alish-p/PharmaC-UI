import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import CameraViewfinder from './camera-viewfinder';

export default function PrescriptionScannerDialog({ open, onClose, onApplyToBill }) {
  const [sourceMode, setSourceMode] = useState('camera'); // 'camera' | 'upload'
  const [, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [, setImageBase64] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Selected items to add to cart: Map of itemIndex -> { medicine, batchId, qty, price }
  const [selectedItems, setSelectedItems] = useState({});
  const [autoApplyCustomer, setAutoApplyCustomer] = useState(true);

  // Reset state
  const handleReset = useCallback(() => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    setZoomLevel(1);
    setIsScanning(false);
    setScanResult(null);
    setSelectedItems({});
  }, []);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle capture from camera viewfinder
  const handleCameraCapture = ({ file, previewUrl, base64 }) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setImageBase64(base64);
    triggerScan(file, base64, false);
  };

  // Handle file drop/upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, WEBP)');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);

    // Read base64
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
      triggerScan(file, reader.result, false);
    };
    reader.readAsDataURL(file);
  };

  // Trigger scanning API
  const triggerScan = async (fileObj, base64Data, simulate = false) => {
    setIsScanning(true);
    setScanProgressText('Scanning prescription with Gemini Vision OCR...');

    const stepTimer1 = setTimeout(() => {
      setScanProgressText('Deciphering doctor handwriting & clinical dosages...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setScanProgressText('Matching active medicine inventory & stock batches...');
    }, 3000);

    try {
      let res;
      if (fileObj) {
        const formData = new FormData();
        formData.append('prescriptionImage', fileObj);
        res = await axios.post(endpoints.prescriptions.scan, formData, {
          params: simulate ? { simulate: 'true' } : {},
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axios.post(
          endpoints.prescriptions.scan,
          { imageBase64: base64Data },
          { params: simulate ? { simulate: 'true' } : {} }
        );
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const { data } = res.data;
      setScanResult(data);

      // Pre-select in-stock medicines and chosen batches
      const initialSelected = {};
      data.matchedMedicines.forEach((item, idx) => {
        if (item.matchStatus === 'exact_in_stock' && item.availableBatches?.length > 0) {
          const firstBatch = item.availableBatches[0];
          initialSelected[idx] = {
            medicine: item.matchedMedicine,
            batchId: firstBatch._id,
            batchNumber: firstBatch.batchNumber,
            qty: Math.min(item.selectedQty || 1, firstBatch.quantity),
            price: firstBatch.salePrice,
            gstRate: firstBatch.gstRate || 12,
            prescribedItem: item.prescribedItem,
          };
        } else if (item.matchStatus === 'salt_alternative_available' && item.substitutes?.length > 0) {
          // Preselect the first salt substitute
          const sub = item.substitutes[0];
          const firstBatch = sub.batches[0];
          initialSelected[idx] = {
            medicine: sub.medicine,
            batchId: firstBatch._id,
            batchNumber: firstBatch.batchNumber,
            qty: Math.min(item.selectedQty || 1, firstBatch.quantity),
            price: firstBatch.salePrice,
            gstRate: firstBatch.gstRate || 12,
            prescribedItem: item.prescribedItem,
            isSubstitute: true,
          };
        }
      });
      setSelectedItems(initialSelected);

      toast.success(
        `Prescription analyzed! ${data.matchedMedicines.length} medicine(s) detected.`
      );
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Scan error:', err);

      if (err.code === 'MISSING_GEMINI_API_KEY' || err.message?.includes('GEMINI_API_KEY')) {
        toast.error('Gemini API key missing in .env. Running demo simulation mode...');
        triggerScan(null, null, true);
        return;
      }

      toast.error(err.message || 'Failed to scan prescription');
    } finally {
      setIsScanning(false);
      setScanProgressText('');
    }
  };

  // Toggle medicine checkbox
  const handleToggleItem = (idx, item) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[idx]) {
        delete copy[idx];
      } else {
        // Find default batch
        const batchList =
          item.availableBatches?.length > 0
            ? item.availableBatches
            : item.substitutes?.[0]?.batches || [];
        const chosenBatch = batchList[0];
        const med = item.matchedMedicine || item.substitutes?.[0]?.medicine;

        if (chosenBatch && med) {
          copy[idx] = {
            medicine: med,
            batchId: chosenBatch._id,
            batchNumber: chosenBatch.batchNumber,
            qty: Math.min(item.selectedQty || 1, chosenBatch.quantity),
            price: chosenBatch.salePrice,
            gstRate: chosenBatch.gstRate || 12,
            prescribedItem: item.prescribedItem,
            isSubstitute: !item.matchedMedicine,
          };
        }
      }
      return copy;
    });
  };

  // Update selected batch
  const handleBatchChange = (idx, batchId, item) => {
    const allBatches = [
      ...(item.availableBatches || []),
      ...(item.substitutes?.flatMap((s) => s.batches) || []),
    ];
    const newBatch = allBatches.find((b) => b._id === batchId);
    if (!newBatch) return;

    setSelectedItems((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        batchId: newBatch._id,
        batchNumber: newBatch.batchNumber,
        price: newBatch.salePrice,
        gstRate: newBatch.gstRate || 12,
        qty: Math.min(prev[idx]?.qty || 1, newBatch.quantity),
      },
    }));
  };

  // Update quantity for selected item
  const handleQtyChange = (idx, delta, maxStock) => {
    setSelectedItems((prev) => {
      const current = prev[idx];
      if (!current) return prev;
      const nextQty = Math.max(1, Math.min(maxStock, (current.qty || 1) + delta));
      return {
        ...prev,
        [idx]: {
          ...current,
          qty: nextQty,
        },
      };
    });
  };

  // Add all selected items to POS Bill
  const handleApplyToBill = () => {
    const itemsToAdd = Object.values(selectedItems);
    if (itemsToAdd.length === 0) {
      toast.error('Please select at least one in-stock medicine to add to bill');
      return;
    }

    const patientCustomer = autoApplyCustomer ? scanResult?.matchedCustomer : null;

    onApplyToBill(itemsToAdd, patientCustomer, scanResult);
    toast.success(`${itemsToAdd.length} medicine(s) added to billing cart!`);
    handleClose();
  };

  // Calculate total price of selected items
  const billEstimate = useMemo(
    () =>
      Object.values(selectedItems).reduce(
        (sum, item) => sum + (item.price || 0) * (item.qty || 1),
        0
      ),
    [selectedItems]
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: { xs: '96vh', md: '92vh' },
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ px: 3, py: 2, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.5,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:document-medicine-bold-duotone" width={26} />
            </Box>
            <div>
              <Typography variant="h6">AI Prescription Scanner & Medicine Matcher</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Capture or upload handwritten prescriptions to instantly identify medicines, salt compositions, and live stock batches
              </Typography>
            </div>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Demo Simulation Button for testing */}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
              onClick={() => triggerScan(null, null, true)}
              disabled={isScanning}
            >
              Test Sample Prescription
            </Button>

            <IconButton onClick={handleClose} size="small">
              <Iconify icon="solar:close-circle-bold" />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      {/* Main Content Area */}
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: { xs: 'auto', md: 'hidden' },
        }}
      >
        <Grid container sx={{ flex: 1, minHeight: { xs: 'auto', md: 0 }, height: { md: '100%' } }}>
          {/* LEFT PANE: Camera Capture / Upload & Image Preview */}
          <Grid
            xs={12}
            md={5}
            sx={{
              height: { xs: 'auto', md: '100%' },
              minHeight: 0,
              borderRight: (t) => ({ md: `1px solid ${t.palette.divider}` }),
              borderBottom: (t) => ({ xs: `1px solid ${t.palette.divider}`, md: 'none' }),
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.neutral',
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(145, 158, 171, 0.35)',
                borderRadius: 3,
              },
            }}
          >
            {/* Top Mode Selector when no image selected */}
            {!imagePreview ? (
              <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    variant={sourceMode === 'camera' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<Iconify icon="solar:camera-bold" />}
                    onClick={() => setSourceMode('camera')}
                  >
                    Live Camera
                  </Button>
                  <Button
                    fullWidth
                    variant={sourceMode === 'upload' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<Iconify icon="solar:upload-bold" />}
                    onClick={() => setSourceMode('upload')}
                  >
                    Upload Image
                  </Button>
                </Stack>

                {sourceMode === 'camera' ? (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <CameraViewfinder onCapture={handleCameraCapture} onCancel={handleClose} />
                  </Box>
                ) : (
                  <Box
                    component="label"
                    sx={{
                      flex: 1,
                      minHeight: 350,
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      p: 4,
                      textAlign: 'center',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                    />
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Iconify icon="solar:upload-square-bold" width={36} />
                    </Box>
                    <Typography variant="subtitle1">Click to Upload or Drag & Drop</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 280 }}>
                      Supports clear photographs or scans of prescriptions (JPG, PNG, WEBP up to 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              /* Image Preview & Zoom Controls */
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ p: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}
                >
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:file-check-bold" color="success.main" />
                    Prescription Image
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Zoom Out">
                      <IconButton size="small" onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}>
                        <Iconify icon="solar:magnifer-zoom-out-bold" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">{Math.round(zoomLevel * 100)}%</Typography>
                    <Tooltip title="Zoom In">
                      <IconButton size="small" onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}>
                        <Iconify icon="solar:magnifer-zoom-in-bold" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Zoom">
                      <IconButton size="small" onClick={() => setZoomLevel(1)}>
                        <Iconify icon="solar:restart-bold" />
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                      onClick={handleReset}
                      sx={{ ml: 1 }}
                    >
                      Retake
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.900',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Prescription Scan"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      borderRadius: 6,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  />
                </Box>
              </Box>
            )}
          </Grid>

          {/* RIGHT PANE: Extraction Results, Inventory Matching & Cart Selection */}
          <Grid
            xs={12}
            md={7}
            sx={{
              height: { xs: 'auto', md: '100%' },
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* Loading / Scanning Progress */}
            {isScanning ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                }}
              >
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <CircularProgress size={72} thickness={4} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:magic-stick-3-bold" width={32} sx={{ color: 'primary.main' }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Reading Prescription with AI
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                  {scanProgressText || 'Deciphering doctor handwriting, brands, and dosage strengths...'}
                </Typography>
                <Box sx={{ width: '60%', maxWidth: 360 }}>
                  <LinearProgress />
                </Box>
              </Box>
            ) : !scanResult ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Iconify icon="solar:scanner-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6">No Prescription Scanned Yet</Typography>
                <Typography variant="body2" sx={{ maxWidth: 360, mt: 0.5 }}>
                  Snap a picture with the camera viewfinder or upload an image file on the left to begin automated extraction.
                </Typography>
              </Box>
            ) : (
              /* Scanning Results Display with visible custom scrollbar */
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  p: { xs: 2, md: 3 },
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(145, 158, 171, 0.08)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(145, 158, 171, 0.45)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(145, 158, 171, 0.75)',
                  },
                }}
              >
                {/* Doctor & Patient Overview Header */}
                <Card sx={{ p: 2.5, mb: 3, bgcolor: 'background.neutral' }}>
                  <Grid container spacing={2}>
                    {/* Doctor Info */}
                    <Grid xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
                          Prescribing Doctor
                        </Typography>
                        <Typography variant="subtitle1">
                          {scanResult.doctor?.name || 'Doctor Name Not Detected'}
                        </Typography>
                        {scanResult.doctor?.clinic && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {scanResult.doctor.clinic}
                          </Typography>
                        )}
                        {scanResult.doctor?.regNo && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            Reg: {scanResult.doctor.regNo}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>

                    {/* Patient Info */}
                    <Grid xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
                          Patient Details
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">
                            {scanResult.patient?.name || 'Walk-in Patient'}
                          </Typography>
                          {scanResult.patient?.age && (
                            <Chip size="small" label={`${scanResult.patient.age}`} />
                          )}
                          {scanResult.patient?.gender && (
                            <Chip size="small" label={scanResult.patient.gender} />
                          )}
                        </Stack>

                        {/* Customer match notification */}
                        {scanResult.matchedCustomer ? (
                          <Alert severity="success" icon={<Iconify icon="solar:user-check-bold" />} sx={{ py: 0.2, px: 1, mt: 1 }}>
                            <Typography variant="caption">
                              Registered customer: <strong>{scanResult.matchedCustomer.name}</strong> ({scanResult.matchedCustomer.phone || 'No phone'})
                            </Typography>
                          </Alert>
                        ) : scanResult.patient?.name ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            New patient (not yet registered in database)
                          </Typography>
                        ) : null}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Diagnosis & Date */}
                  {(scanResult.diagnosis || scanResult.prescriptionDate) && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        {scanResult.prescriptionDate && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Prescription Date: <strong>{scanResult.prescriptionDate}</strong>
                          </Typography>
                        )}
                        {scanResult.diagnosis && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Diagnosis: <strong>{scanResult.diagnosis}</strong>
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Card>

                {/* Patient Auto-Fill Toggle */}
                {scanResult.patient?.name && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoApplyCustomer}
                          onChange={(e) => setAutoApplyCustomer(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Auto-select <strong>{scanResult.matchedCustomer?.name || scanResult.patient.name}</strong> as customer in POS bill
                        </Typography>
                      }
                    />
                  </Stack>
                )}

                {/* Medicines List Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="h6">
                    Detected Medicines ({scanResult.matchedMedicines?.length || 0})
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      color="success"
                      variant="soft"
                      label={`${scanResult.summary?.inStockCount || 0} In Stock`}
                    />
                    {(scanResult.summary?.substituteCount || 0) > 0 && (
                      <Chip
                        size="small"
                        color="warning"
                        variant="soft"
                        label={`${scanResult.summary.substituteCount} Substitute`}
                      />
                    )}
                    {(scanResult.summary?.outOfStockCount || 0) > 0 && (
                      <Chip
                        size="small"
                        color="error"
                        variant="soft"
                        label={`${scanResult.summary.outOfStockCount} Out of Stock`}
                      />
                    )}
                  </Stack>
                </Stack>

                {/* List of Detected Medicines */}
                <Stack spacing={2}>
                  {scanResult.matchedMedicines?.map((item, idx) => {
                    const isChecked = !!selectedItems[idx];
                    const chosenState = selectedItems[idx];

                    return (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: isChecked ? 'primary.main' : 'divider',
                          bgcolor: isChecked ? 'action.selected' : 'background.paper',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Top row: Checkbox, Medicine Name & Match Status */}
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggleItem(idx, item)}
                                disabled={
                                  item.matchStatus === 'not_in_catalog' ||
                                  (item.matchStatus === 'exact_out_of_stock' &&
                                    (!item.substitutes || item.substitutes.length === 0))
                                }
                                sx={{ p: 0, mt: 0.3 }}
                              />

                              <div>
                                <Typography variant="subtitle1">
                                  {item.prescribedItem.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                  Salt: {item.prescribedItem.activeIngredient || 'Salt not determined'}
                                </Typography>
                                {item.prescribedItem.dosage && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    Dosage: {item.prescribedItem.dosage} • Form: {item.prescribedItem.form} • Frequency: {item.prescribedItem.frequency || 'N/A'} • Duration: {item.prescribedItem.duration || 'N/A'}
                                  </Typography>
                                )}
                                {item.prescribedItem.instructions && (
                                  <Typography variant="caption" sx={{ color: 'info.main', display: 'block' }}>
                                    Instructions: {item.prescribedItem.instructions}
                                  </Typography>
                                )}
                              </div>
                            </Stack>

                            {/* Status Badge */}
                            <div>
                              {item.matchStatus === 'exact_in_stock' && (
                                <Label color="success" startIcon={<Iconify icon="solar:check-circle-bold" />}>
                                  In Stock ({item.matchedMedicine?.totalStock} units)
                                </Label>
                              )}

                              {item.matchStatus === 'salt_alternative_available' && (
                                <Label color="warning" startIcon={<Iconify icon="solar:transfer-horizontal-bold" />}>
                                  Substitute In Stock
                                </Label>
                              )}

                              {item.matchStatus === 'exact_out_of_stock' && (
                                <Label color="error" startIcon={<Iconify icon="solar:close-circle-bold" />}>
                                  Out of Stock
                                </Label>
                              )}

                              {item.matchStatus === 'not_in_catalog' && (
                                <Label color="default" startIcon={<Iconify icon="solar:question-circle-bold" />}>
                                  Not in Catalog
                                </Label>
                              )}
                            </div>
                          </Stack>

                          {/* Batch & Quantity controls when medicine is in stock or has substitute */}
                          {(item.matchStatus === 'exact_in_stock' ||
                            item.matchStatus === 'salt_alternative_available') && (
                            <Box
                              sx={{
                                pt: 1.5,
                                borderTop: (t) => `1px dashed ${t.palette.divider}`,
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                {/* Batch Selector */}
                                <Grid xs={12} sm={7}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Dispense from Batch</InputLabel>
                                    <Select
                                      value={chosenState?.batchId || ''}
                                      label="Dispense from Batch"
                                      onChange={(e) => handleBatchChange(idx, e.target.value, item)}
                                      disabled={!isChecked}
                                    >
                                      {/* Direct Batches */}
                                      {item.availableBatches?.map((b) => (
                                        <MenuItem key={b._id} value={b._id}>
                                          Batch {b.batchNumber} • Stock: {b.quantity} • Exp: {new Date(b.expiryDate).toLocaleDateString()} • {fCurrency(b.salePrice)}
                                        </MenuItem>
                                      ))}

                                      {/* Salt Substitutes Batches */}
                                      {item.substitutes?.map((sub) =>
                                        sub.batches.map((b) => (
                                          <MenuItem key={b._id} value={b._id}>
                                            [Substitute] {sub.medicine.name} • Batch {b.batchNumber} • Stock: {b.quantity} • {fCurrency(b.salePrice)}
                                          </MenuItem>
                                        ))
                                      )}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                {/* Quantity Counter */}
                                <Grid xs={12} sm={5}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Dispense Qty:
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      disabled={!isChecked || (chosenState?.qty || 1) <= 1}
                                      onClick={() => handleQtyChange(idx, -1, 999)}
                                    >
                                      <Iconify icon="solar:minus-circle-bold" />
                                    </IconButton>
                                    <Typography variant="subtitle2" sx={{ minWidth: 24, textAlign: 'center' }}>
                                      {chosenState?.qty || 1}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      disabled={!isChecked}
                                      onClick={() => handleQtyChange(idx, 1, 999)}
                                    >
                                      <Iconify icon="solar:add-circle-bold" />
                                    </IconButton>

                                    {chosenState && (
                                      <Typography variant="subtitle2" color="primary.main" sx={{ ml: 1 }}>
                                        {fCurrency((chosenState.price || 0) * (chosenState.qty || 1))}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Bottom Actions Bar */}
            {scanResult && (
              <Box
                sx={{
                  p: 2.5,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: 'background.neutral',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <div>
                    <Typography variant="subtitle2">
                      {Object.keys(selectedItems).length} of {scanResult.matchedMedicines?.length || 0} items selected
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Estimated Subtotal: <strong>{fCurrency(billEstimate)}</strong>
                    </Typography>
                  </div>

                  <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" color="inherit" onClick={handleReset}>
                      Scan Another
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Iconify icon="solar:cart-plus-bold" />}
                      disabled={Object.keys(selectedItems).length === 0}
                      onClick={handleApplyToBill}
                    >
                      Add Selected to Bill ({Object.keys(selectedItems).length})
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
