import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/utils/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const DOSAGE_OPTIONS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Ointment',
  'Cream',
  'Drops',
  'Inhaler',
  'Powder',
  'Gel',
  'Other',
];

const SCHEDULE_OPTIONS = ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Narcotic'];

export default function MedicinesListPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dosageFilter, setDosageFilter] = useState('');

  // Dialog State for New Medicine
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    dosageForm: 'Tablet',
    category: 'General',
    unit: '10 Tablets / Strip',
    hsnCode: '3004',
    scheduleType: 'OTC',
    rackLocation: '',
    minStockAlert: 10,
  });

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (dosageFilter) params.dosageForm = dosageFilter;

      const res = await axios.get(endpoints.medicines, { params });
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [search, dosageFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMedicines]);

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      dosageForm: 'Tablet',
      category: 'General',
      unit: '10 Tablets / Strip',
      hsnCode: '3004',
      scheduleType: 'OTC',
      rackLocation: '',
      minStockAlert: 10,
    });
    setOpenDialog(true);
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.genericName) {
      toast.error('Medicine name and generic salt composition are required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(endpoints.medicines, formData);
      toast.success('Medicine added to catalog successfully');
      setOpenDialog(false);
      fetchMedicines();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create medicine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Medicines Master Catalog</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage medicine formulations, salt compositions, and live inventory stock
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Add Medicine
        </Button>
      </Stack>

      {/* Filter / Search Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by brand name, generic salt, manufacturer, or rack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Dosage Form</InputLabel>
            <Select
              value={dosageFilter}
              label="Dosage Form"
              onChange={(e) => setDosageFilter(e.target.value)}
            >
              <MenuItem value="">All Dosage Forms</MenuItem>
              {DOSAGE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Medicines Table */}
      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Medicine / Brand</TableCell>
                <TableCell>Generic / Salt Composition</TableCell>
                <TableCell>Dosage & Unit</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell align="center">Rack Location</TableCell>
                <TableCell align="center">Available Stock</TableCell>
                <TableCell align="center">Schedule</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1">No medicines found</Typography>
                    <Typography variant="caption">Try adjusting your search filter or add a new medicine.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((med) => (
                  <TableRow key={med._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{med.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        HSN: {med.hsnCode || '3004'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{med.genericName}</Typography>
                    </TableCell>

                    <TableCell>
                      <Label color="default" sx={{ mr: 1 }}>
                        {med.dosageForm}
                      </Label>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {med.unit}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{med.manufacturer || '—'}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Label variant="soft" color="info">
                        {med.rackLocation || 'Not Assigned'}
                      </Label>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        <Typography
                          variant="subtitle2"
                          color={med.isLowStock ? 'error.main' : 'text.primary'}
                        >
                          {med.totalStock} units
                        </Typography>
                        {med.isLowStock && (
                          <Label color="error" variant="filled" sx={{ ml: 0.5 }}>
                            Low
                          </Label>
                        )}
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {med.batchCount} {med.batchCount === 1 ? 'batch' : 'batches'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Label
                        color={
                          med.scheduleType === 'Schedule H1' || med.scheduleType === 'Schedule X'
                            ? 'error'
                            : med.scheduleType === 'Schedule H'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {med.scheduleType}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Add Medicine Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Medicine to Catalog</DialogTitle>
        <form onSubmit={handleCreateMedicine}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                label="Brand / Commercial Name"
                placeholder="e.g. Augmentin 625 Duo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <TextField
                required
                label="Generic Name / Salt Composition"
                placeholder="e.g. Amoxicillin & Potassium Clavulanate"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Dosage Form</InputLabel>
                  <Select
                    value={formData.dosageForm}
                    label="Dosage Form"
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  >
                    {DOSAGE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Schedule Category</InputLabel>
                  <Select
                    value={formData.scheduleType}
                    label="Schedule Category"
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                  >
                    {SCHEDULE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Packaging / Unit"
                  placeholder="e.g. Strip of 10 Tablets"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="HSN Code"
                  placeholder="3004"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Manufacturer / Brand"
                  placeholder="e.g. GlaxoSmithKline"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Rack / Shelf Location"
                  placeholder="e.g. Rack A1, Shelf 3"
                  value={formData.rackLocation}
                  onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                />
              </Stack>

              <TextField
                type="number"
                label="Low Stock Alert Threshold (Units)"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Medicine'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
