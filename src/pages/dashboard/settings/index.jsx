import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

export default function PharmacySettingsPage() {
  const { tenant } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    dlNumber: '',
    gstNumber: '',
    panNumber: '',
    address: {
      line1: '',
      city: '',
      state: '',
      pincode: '',
    },
    contactDetails: {
      email: '',
      phone: '',
      website: '',
    },
    config: {
      inventory: {
        nearExpiryDaysAlert: 90,
        defaultLowStockAlert: 10,
      },
      invoice: {
        prefix: 'PHARM-',
        termsAndConditions: '',
      },
    },
  });

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.tenants);
        const data = res.data;
        setFormData({
          name: data.name || '',
          tagline: data.tagline || '',
          dlNumber: data.dlNumber || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          address: {
            line1: data.address?.line1 || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
          },
          contactDetails: {
            email: data.contactDetails?.email || '',
            phone: data.contactDetails?.phone || '',
            website: data.contactDetails?.website || '',
          },
          config: {
            inventory: {
              nearExpiryDaysAlert: data.config?.inventory?.nearExpiryDaysAlert || 90,
              defaultLowStockAlert: data.config?.inventory?.defaultLowStockAlert || 10,
            },
            invoice: {
              prefix: data.config?.invoice?.prefix || 'PHARM-',
              termsAndConditions: data.config?.invoice?.termsAndConditions || '',
            },
          },
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load store settings');
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [tenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.put(endpoints.tenants, formData);
      toast.success('Pharmacy settings updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack sx={{ mb: 4 }}>
        <Typography variant="h4">Pharmacy Store Settings</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Update your store profile, drug license registration, and inventory alert parameters
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* General Information */}
          <Grid xs={12} md={7}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Store Identity & Licenses
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  required
                  label="Pharmacy Store Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <TextField
                  label="Tagline / Slogan"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Drug License Number (DL No.)"
                    placeholder="20B/21B-..."
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
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Store Address & Contact
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Street Address / Shop No"
                  value={formData.address.line1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, line1: e.target.value },
                    })
                  }
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={formData.address.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, pincode: e.target.value },
                      })
                    }
                  />
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Store Email"
                    value={formData.contactDetails.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactDetails: { ...formData.contactDetails, email: e.target.value },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Store Phone"
                    value={formData.contactDetails.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactDetails: { ...formData.contactDetails, phone: e.target.value },
                      })
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* Config & Alerts */}
          <Grid xs={12} md={5}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Inventory Alerts
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  type="number"
                  label="Near-Expiry Alert (Days)"
                  helperText="Batches expiring within this number of days will be flagged"
                  value={formData.config.inventory.nearExpiryDaysAlert}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        inventory: {
                          ...formData.config.inventory,
                          nearExpiryDaysAlert: Number(e.target.value),
                        },
                      },
                    })
                  }
                />

                <TextField
                  type="number"
                  label="Default Low Stock Threshold (Units)"
                  helperText="Medicines with total stock below this will trigger low stock warnings"
                  value={formData.config.inventory.defaultLowStockAlert}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        inventory: {
                          ...formData.config.inventory,
                          defaultLowStockAlert: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Invoice & Billing Rules
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Invoice Number Prefix"
                  value={formData.config.invoice.prefix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        invoice: {
                          ...formData.config.invoice,
                          prefix: e.target.value,
                        },
                      },
                    })
                  }
                />

                <TextField
                  multiline
                  rows={3}
                  label="Invoice Terms & Conditions"
                  value={formData.config.invoice.termsAndConditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        invoice: {
                          ...formData.config.invoice,
                          termsAndConditions: e.target.value,
                        },
                      },
                    })
                  }
                />

                <LoadingButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  loading={submitting}
                  startIcon={<Iconify icon="solar:check-read-bold" />}
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
