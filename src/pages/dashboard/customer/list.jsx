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

export default function CustomersListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    doctorName: '',
    address: '',
    notes: '',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.customers);
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      doctorName: '',
      address: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Customer name is required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(endpoints.customers, formData);
      toast.success('Customer profile saved successfully');
      setOpenDialog(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Customers & Patients</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage patient records, prescriptions history, and consulting doctors
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:users-group-two-rounded-bold" />}
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Add Customer
        </Button>
      </Stack>

      {/* Table */}
      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Patient / Customer Name</TableCell>
                <TableCell>Phone & Email</TableCell>
                <TableCell>Consulting Doctor</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Medical Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No customer records created yet.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((cust) => (
                  <TableRow key={cust._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{cust.name}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{cust.phone || '—'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {cust.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{cust.doctorName ? `Dr. ${cust.doctorName}` : '—'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{cust.address || '—'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {cust.notes || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Customer / Patient Profile</DialogTitle>
        <form onSubmit={handleCreateCustomer}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  placeholder="ramesh@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Stack>

              <TextField
                label="Consulting Doctor Name"
                placeholder="e.g. Dr. Rajesh Gupta (MD, Cardiology)"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              />

              <TextField
                label="Address / Area"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <TextField
                multiline
                rows={2}
                label="Prescription & Medical Notes"
                placeholder="Known allergies, regular medication requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Customer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
