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
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export default function BatchesListPage() {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');

  // Dialog State for New Batch
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicine: '',
    batchNumber: '',
    expiryDate: '',
    mfgDate: '',
    mrp: '',
    purchaseRate: '',
    salePrice: '',
    gstRate: 12,
    quantity: '',
    rackLocation: '',
  });

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (expiryFilter) params.expiringDays = expiryFilter;

      const res = await axios.get(endpoints.batches, { params });
      setBatches(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, [search, expiryFilter]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(endpoints.medicines);
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchMedicines();
  }, [fetchBatches]);

  const handleOpenDialog = () => {
    setFormData({
      medicine: medicines[0]?._id || '',
      batchNumber: '',
      expiryDate: '',
      mfgDate: '',
      mrp: '',
      purchaseRate: '',
      salePrice: '',
      gstRate: 12,
      quantity: '',
      rackLocation: '',
    });
    setOpenDialog(true);
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.medicine || !formData.batchNumber || !formData.expiryDate || !formData.quantity) {
      toast.error('Medicine, batch number, expiry date, and quantity are required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(endpoints.batches, formData);
      toast.success('Batch added to inventory successfully');
      setOpenDialog(false);
      fetchBatches();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return <Label color="error">Expired</Label>;
    }
    if (diffDays <= 90) {
      return <Label color="warning">{diffDays} days left</Label>;
    }
    return <Label color="success">Valid ({fDate(expiryDate)})</Label>;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Batches & Inventory Tracking</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track medicine batch numbers, expiry dates, purchase rates, MRP, and rack locations
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Add Batch / Inward Stock
        </Button>
      </Stack>

      {/* Filter / Search Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by batch number (e.g. AUG-9921)..."
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

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Expiry Filter</InputLabel>
            <Select
              value={expiryFilter}
              label="Expiry Filter"
              onChange={(e) => setExpiryFilter(e.target.value)}
            >
              <MenuItem value="">All Batches</MenuItem>
              <MenuItem value="30">Expiring in 30 Days</MenuItem>
              <MenuItem value="90">Expiring in 90 Days</MenuItem>
              <MenuItem value="180">Expiring in 6 Months</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Batches Table */}
      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Batch No</TableCell>
                <TableCell>Medicine Name</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell align="right">Available Stock</TableCell>
                <TableCell align="right">Purchase Rate</TableCell>
                <TableCell align="right">MRP / Sale Price</TableCell>
                <TableCell align="center">Rack Location</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1">No batches found</Typography>
                    <Typography variant="caption">Inward new stock batches to manage inventory.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch._id} hover>
                    <TableCell>
                      <Label color="default" sx={{ typography: 'subtitle2' }}>
                        {batch.batchNumber}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2">{batch.medicine?.name || 'Unknown'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {batch.medicine?.genericName}
                      </Typography>
                    </TableCell>

                    <TableCell>{getExpiryBadge(batch.expiryDate)}</TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2" color={batch.quantity <= 10 ? 'error.main' : 'text.primary'}>
                        {batch.quantity} {batch.medicine?.unit?.split(' ')[1] || 'units'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">{fCurrency(batch.purchaseRate)}</TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2">{fCurrency(batch.salePrice)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        MRP: {fCurrency(batch.mrp)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Label variant="soft" color="info">
                        {batch.rackLocation || 'Shelf'}
                      </Label>
                    </TableCell>

                    <TableCell align="center">
                      <Label color={batch.status === 'active' ? 'success' : 'default'}>
                        {batch.status}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Add Batch Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inward Stock / Add Medicine Batch</DialogTitle>
        <form onSubmit={handleCreateBatch}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <FormControl fullWidth required>
                <InputLabel>Select Medicine</InputLabel>
                <Select
                  value={formData.medicine}
                  label="Select Medicine"
                  onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                >
                  {medicines.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.name} ({m.genericName}) - {m.unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                label="Batch Number"
                placeholder="e.g. AUG-9921"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Mfg Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.mfgDate}
                  onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Expiry Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Stock Quantity (Units)"
                  placeholder="e.g. 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="GST Rate (%)"
                  type="number"
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Purchase Rate (₹)"
                  placeholder="Cost per unit"
                  value={formData.purchaseRate}
                  onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="MRP (₹)"
                  placeholder="Max Retail Price"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Sale Price (₹)"
                  placeholder="Customer billing rate"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </Stack>

              <TextField
                label="Rack / Shelf Location"
                placeholder="e.g. Rack A1, Bin 4"
                value={formData.rackLocation}
                onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Save Batch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
