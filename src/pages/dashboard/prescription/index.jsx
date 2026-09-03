import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import PrescriptionScannerDialog from 'src/sections/prescription/prescription-scanner-dialog';

export default function PrescriptionWorkbenchPage() {
  const navigate = useNavigate();
  const [scannerOpen, setScannerOpen] = useState(false);

  // When items are selected from scanner dialog on this standalone page
  const handleApplyToBill = (itemsToAdd, patientCustomer, scanResult) => {
    // Store in sessionStorage so POS billing page picks them up
    sessionStorage.setItem(
      'pharmac_pending_prescription_bill',
      JSON.stringify({
        items: itemsToAdd,
        customer: patientCustomer,
        doctor: scanResult?.doctor,
        prescriptionDate: scanResult?.prescriptionDate,
      })
    );

    // Navigate to POS Billing page
    navigate(paths.dashboard.pos.root);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 4 }}
      >
        <div>
          <Typography variant="h4">AI Prescription Reader & Inventory Matcher</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Decipher handwritten prescriptions with Google Gemini Vision and automatically match stock batches
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Iconify icon="solar:camera-bold" />}
          onClick={() => setScannerOpen(true)}
          sx={{ height: 48, px: 3, boxShadow: '0 4px 14px rgba(0, 167, 111, 0.35)' }}
        >
          Scan / Upload Prescription
        </Button>
      </Stack>

      {/* Interactive Launch Card */}
      <Card
        sx={{
          p: 6,
          textAlign: 'center',
          bgcolor: 'background.neutral',
          border: '2px dashed',
          borderColor: 'primary.light',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              boxShadow: '0 8px 24px rgba(0, 167, 111, 0.4)',
            }}
          >
            <Iconify icon="solar:scanner-bold-duotone" width={44} />
          </Box>

          <Typography variant="h5" sx={{ mb: 1 }}>
            Ready to Scan a Medical Prescription?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto', mb: 3 }}>
            Launch the AI camera viewfinder or upload an image to extract medicines, find active batches in your pharmacy, and dispense immediately.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Iconify icon="solar:camera-bold" />}
              onClick={() => setScannerOpen(true)}
              sx={{ px: 3.5, py: 1.2 }}
            >
              Open Camera & Scanner
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      <PrescriptionScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onApplyToBill={handleApplyToBill}
      />
    </Container>
  );
}
