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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">AI Prescription Reader & Inventory Matcher</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Decipher handwritten prescriptions with Google Gemini Vision and automatically match stock batches
        </Typography>
      </Box>

      {/* Interactive Launch Card */}
      <Card
        sx={{
          p: { xs: 3, sm: 6 },
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
              width: { xs: 64, sm: 80 },
              height: { xs: 64, sm: 80 },
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
            <Iconify icon="solar:scanner-bold-duotone" width={36} />
          </Box>

          <Typography variant="h5" sx={{ mb: 1, fontSize: { xs: 18, sm: 24 } }}>
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
              sx={{ px: 3.5, py: 1.2, width: { xs: '100%', sm: 'auto' } }}
            >
              Open Camera & Scanner
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      {scannerOpen && (
        <PrescriptionScannerDialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onApplyToBill={handleApplyToBill}
        />
      )}
    </Container>
  );
}
