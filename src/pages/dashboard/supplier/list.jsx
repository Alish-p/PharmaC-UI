import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export default function SuppliersListPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    dlNumber: '',
    gstNumber: '',
    creditPeriodDays: 30,
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.suppliers);
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      dlNumber: '',
      gstNumber: '',
      creditPeriodDays: 30,
    });
    setOpenDialog(true);
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Supplier name is required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(endpoints.suppliers, formData);
      toast.success('Supplier added successfully');
      setOpenDialog(false);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to add supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Suppliers & Distributors</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage medicine distributors, drug license registrations, and credit terms
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:shop-2-bold" />}
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Add Supplier
        </Button>
      </Stack>

      {/* Table */}
      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Supplier / Distributor</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone & Email</TableCell>
                <TableCell>DL & GSTIN</TableCell>
                <TableCell align="center">Credit Days</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No suppliers registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((sup) => (
                  <TableRow key={sup._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{sup.name}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{sup.contactPerson || '—'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{sup.phone || '—'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {sup.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">DL: {sup.dlNumber || '—'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        GST: {sup.gstNumber || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="subtitle2">{sup.creditPeriodDays} days</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Supplier / Distributor</DialogTitle>
        <form onSubmit={handleCreateSupplier}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                label="Supplier / Distributor Name"
                placeholder="e.g. Medplus Distributors Pvt Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  placeholder="e.g. Amit Verma"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Stack>

              <TextField
                label="Email Address"
                placeholder="orders@medplusdist.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Drug License (DL No.)"
                  placeholder="20B/21B-DL-001"
                  value={formData.dlNumber}
                  onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="GSTIN"
                  placeholder="29AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </Stack>

              <TextField
                type="number"
                label="Credit Period (Days)"
                value={formData.creditPeriodDays}
                onChange={(e) => setFormData({ ...formData, creditPeriodDays: Number(e.target.value) })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Supplier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
