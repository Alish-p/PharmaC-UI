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
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/utils/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const ROLES_LIST = [
  { value: 'owner', label: 'Store Owner' },
  { value: 'admin', label: 'Pharmacy Admin' },
  { value: 'pharmacist', label: 'Registered Pharmacist' },
  { value: 'cashier', label: 'Cashier / Billing Counter' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
];

export default function PharmacyStaffListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'pharmacist',
    designation: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.users);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pharmacy staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'pharmacist',
      designation: '',
    });
    setOpenDialog(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      toast.error('Name, email, mobile, and password are required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(endpoints.users, formData);
      toast.success('Staff member added successfully');
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'pharmacist':
        return 'info';
      case 'cashier':
        return 'warning';
      case 'inventory_manager':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Staff & Roles</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage pharmacy team members, role assignments, and system permissions
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:user-plus-bold" />}
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Add Staff Member
        </Button>
      </Stack>

      {/* Staff Table */}
      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Member Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Contact Details</TableCell>
                <TableCell align="center">Assigned Role</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No staff members registered.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((member) => (
                  <TableRow key={member._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{member.name}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{member.designation || 'Staff'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{member.email}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {member.mobile}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Label color={getRoleColor(member.role)} sx={{ textTransform: 'capitalize' }}>
                        {member.role?.replace('_', ' ')}
                      </Label>
                    </TableCell>

                    <TableCell align="center">
                      <Label color={member.status === 'active' ? 'success' : 'default'}>
                        {member.status}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Pharmacy Staff Member</DialogTitle>
        <form onSubmit={handleCreateUser}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                label="Full Name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Email Address"
                  placeholder="rahul@pharmacy.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  label="Mobile Number"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </Stack>

              <TextField
                required
                type="password"
                label="Login Password"
                placeholder="Temporary login password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Pharmacy Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Pharmacy Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {ROLES_LIST.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Designation / Title"
                  placeholder="e.g. Chief Pharmacist"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Staff'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
