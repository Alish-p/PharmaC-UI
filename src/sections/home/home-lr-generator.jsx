import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BlobProvider } from '@react-pdf/renderer';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import LRPdf from 'src/pdfs/lr-pdf';

import { Iconify } from 'src/components/iconify';

// -------------------------------------------------------------------------

export function HomeLRGenerator() {
  const theme = useTheme();
  const [generating, setGenerating] = useState(false);
  const neutralBg = alpha(theme.palette.grey[500], 0.04);
  const softBorder = `1px solid ${theme.palette.divider}`;
  const sectionCardSx = {
    p: 3,
    border: softBorder,
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: 'none',
  };

  const companyDialog = useBoolean();
  const consignorDialog = useBoolean();
  const consigneeDialog = useBoolean();

  const methods = useForm({
    defaultValues: {
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyGst: '',
      companyPan: '',
      lrNumber: '',
      lrDate: dayjs().format('YYYY-MM-DD'),
      consignorName: '',
      consignorAddress: '',
      consignorGst: '',
      consigneeName: '',
      consigneeAddress: '',
      consigneeGst: '',
      vehicleNo: '',
      driverName: '',
      goods: [{ description: '', quantity: '', weight: '', unit: 'Kg', rate: '', amount: '' }],
      freight: '',
      loadingCharges: '',
      unloadingCharges: '',
      otherCharges: '',
      declaration:
        "Goods booked at owner's risk. The company is not responsible for leakage, breakage, or damage during transit unless specifically insured.",
    },
  });

  const { register, control, handleSubmit, watch, reset } = methods;

  const {
    fields: goodsFields,
    append: appendGoods,
    remove: removeGoods,
  } = useFieldArray({ control, name: 'goods' });

  const values = watch();

  const handleAddGoods = () => {
    appendGoods({ description: '', quantity: '', weight: '', unit: 'Kg', rate: '', amount: '' });
  };

  const handleDownload = useCallback(async (formData) => {
    setGenerating(true);
    try {
      const doc = <LRPdf data={formData} />;

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      const blob = await new Promise((resolve) => {
        root.render(
          <BlobProvider document={doc}>
            {({ blob: generatedBlob }) => {
              if (generatedBlob) {
                resolve(generatedBlob);
                root.unmount();
                container.remove();
              }
              return null;
            }}
          </BlobProvider>
        );
      });

      const fileName = `LR-${formData.lrNumber || 'receipt'}-${dayjs().format('DDMMYYYY')}.pdf`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to generate LR PDF', error);
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleReset = () => {
    reset();
  };

  const renderSectionTitle = (title, icon) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Iconify icon={icon} width={20} />
      <Typography variant="h6">{title}</Typography>
    </Stack>
  );

  const renderPartyCard = (title, icon, value, onEdit, emptyText, content) => (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: softBorder,
        bgcolor: neutralBg,
        height: 1,
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
          <Iconify icon={icon} width={18} />
          <Typography variant="subtitle1">{title}</Typography>
        </Stack>
        <IconButton color="primary" onClick={onEdit}>
          <Iconify icon={value ? 'solar:pen-bold' : 'mingcute:add-line'} width={20} />
        </IconButton>
      </Stack>

      {value ? (
        content
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );

  const renderCompanySection = renderPartyCard(
    'Transport Company',
    'mdi:office-building-marker-outline',
    values.companyName,
    companyDialog.onTrue,
    'Add your transport company details to populate the LR header.',
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">{values.companyName}</Typography>
      <Typography variant="body2">{values.companyAddress}</Typography>
      <Typography variant="body2">{values.companyPhone}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {values.companyEmail}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        GST: {values.companyGst || 'N/A'}
      </Typography>
    </Stack>
  );

  const renderLRDetailsSection = (
    <Box sx={{ p: 2.5, borderRadius: 2, border: softBorder, bgcolor: neutralBg, height: 1 }}>
      {renderSectionTitle('LR Details', 'mdi:file-document-edit-outline')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="LR Number" {...register('lrNumber')} size="small" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            {...register('lrDate')}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Vehicle No" {...register('vehicleNo')} size="small" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Driver Name" {...register('driverName')} size="small" />
        </Grid>
      </Grid>
    </Box>
  );

  const renderConsignorSection = renderPartyCard(
    'Consignor',
    'mdi:truck-delivery-outline',
    values.consignorName,
    consignorDialog.onTrue,
    'Add sender details for the party dispatching the goods.',
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">{values.consignorName}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {values.consignorAddress}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        GST: {values.consignorGst || 'N/A'}
      </Typography>
    </Stack>
  );

  const renderConsigneeSection = renderPartyCard(
    'Consignee',
    'mdi:package-variant-closed-check',
    values.consigneeName,
    consigneeDialog.onTrue,
    'Add receiver details for the delivery destination.',
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">{values.consigneeName}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {values.consigneeAddress}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        GST: {values.consigneeGst || 'N/A'}
      </Typography>
    </Stack>
  );

  return (
    <Box
      id="lr-generator"
      component="section"
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Card sx={sectionCardSx}>
            <Box
              rowGap={3}
              display="grid"
              alignItems="center"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
              sx={{ mb: 3 }}
            >
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Free Tool
                </Typography>
                <Typography variant="h4">LR Generator</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 680 }}>
                  Create a structured lorry receipt with company, shipment, vehicle, and charge
                  details in the same operational form style used across the dashboard.
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 2,
                  minWidth: { sm: 220 },
                  borderRadius: 2,
                  bgcolor: neutralBg,
                  border: softBorder,
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Document Status
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  Draft LR
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {dayjs(values.lrDate || dayjs()).format('DD MMM YYYY')}
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={{ xs: 2, md: 3 }}
              direction={{ xs: 'column', md: 'row' }}
              divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
            >
              <Box sx={{ width: 1 }}>{renderCompanySection}</Box>
              <Box sx={{ width: 1 }}>{renderLRDetailsSection}</Box>
            </Stack>
          </Card>

          <form onSubmit={handleSubmit(handleDownload)}>
            <Stack spacing={3}>
              <Card sx={sectionCardSx}>
                {renderSectionTitle('Shipment Parties', 'mdi:account-switch-outline')}
                <Stack
                  spacing={{ xs: 2, md: 3 }}
                  direction={{ xs: 'column', md: 'row' }}
                  divider={
                    <Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />
                  }
                >
                  <Box sx={{ width: 1 }}>{renderConsignorSection}</Box>
                  <Box sx={{ width: 1 }}>{renderConsigneeSection}</Box>
                </Stack>
              </Card>

              <Card sx={sectionCardSx}>
                {renderSectionTitle('Goods Details', 'mdi:package-variant-closed')}

                <Stack spacing={2}>
                  {goodsFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: softBorder,
                        bgcolor: neutralBg,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="subtitle2">Goods Item {index + 1}</Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeGoods(index)}
                          disabled={goodsFields.length === 1}
                          size="small"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Description"
                            {...register(`goods.${index}.description`)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Qty"
                            type="number"
                            {...register(`goods.${index}.quantity`)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Weight"
                            type="number"
                            {...register(`goods.${index}.weight`)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} md={1}>
                          <TextField
                            fullWidth
                            label="Unit"
                            {...register(`goods.${index}.unit`)}
                            size="small"
                            placeholder="Kg"
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Rate"
                            type="number"
                            {...register(`goods.${index}.rate`)}
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            {...register(`goods.${index}.amount`)}
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>

                <Button
                  size="small"
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleAddGoods}
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  Add Goods Item
                </Button>
              </Card>

              <Card sx={sectionCardSx}>
                {renderSectionTitle('Charges & Declaration', 'mdi:cash-multiple')}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Freight"
                          type="number"
                          {...register('freight')}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Other Charges"
                          type="number"
                          {...register('otherCharges')}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Declaration"
                          multiline
                          rows={4}
                          {...register('declaration')}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: softBorder,
                        bgcolor: neutralBg,
                        height: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Generation Notes
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Standard India LR formatting will be used for the final PDF output.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Verify names, GST values, route details, and pricing before download.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Empty fields are preserved as-is, so incomplete forms will produce sparse
                          documents.
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={handleReset}
                  startIcon={<Iconify icon="mdi:refresh" />}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  color="primary"
                  disabled={generating}
                  startIcon={
                    generating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Iconify icon="solar:cloud-download-bold" />
                    )
                  }
                  sx={{ px: 4 }}
                >
                  {generating ? 'Processing...' : 'Download LR PDF'}
                </Button>
              </Stack>
            </Stack>
          </form>

          <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
            By using this tool, Tranzit does not assume responsibility for manually entered data.
          </Typography>
        </Stack>
      </Container>

      <Dialog open={companyDialog.value} onClose={companyDialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>Transport Company Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Company Name" {...register('companyName')} />
            <TextField
              fullWidth
              label="Address"
              {...register('companyAddress')}
              multiline
              rows={2}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Phone" {...register('companyPhone')} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Email" {...register('companyEmail')} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="GSTIN" {...register('companyGst')} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="PAN" {...register('companyPan')} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={companyDialog.onFalse} color="inherit">
            Cancel
          </Button>
          <Button onClick={companyDialog.onFalse} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={consignorDialog.value}
        onClose={consignorDialog.onFalse}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Consignor (Sender) Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Consignor Name" {...register('consignorName')} />
            <TextField
              fullWidth
              label="Address"
              {...register('consignorAddress')}
              multiline
              rows={3}
            />
            <TextField fullWidth label="GSTIN" {...register('consignorGst')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={consignorDialog.onFalse} color="inherit">
            Cancel
          </Button>
          <Button onClick={consignorDialog.onFalse} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={consigneeDialog.value}
        onClose={consigneeDialog.onFalse}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Consignee (Receiver) Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Consignee Name" {...register('consigneeName')} />
            <TextField
              fullWidth
              label="Address"
              {...register('consigneeAddress')}
              multiline
              rows={3}
            />
            <TextField fullWidth label="GSTIN" {...register('consigneeGst')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={consigneeDialog.onFalse} color="inherit">
            Cancel
          </Button>
          <Button onClick={consigneeDialog.onFalse} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
