import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function PharmacyOverviewPage() {
  const { tenant } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpi: {
      totalMedicines: 0,
      activeBatches: 0,
      nearExpiryBatches: 0,
      expiredBatches: 0,
      totalSuppliers: 0,
      totalCustomers: 0,
    },
    nearExpiryBatches: [],
    recentMedicines: [],
  });

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.dashboard.summary);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const kpis = [
    {
      title: 'Total Medicines',
      value: data.kpi.totalMedicines,
      icon: 'solar:pill-bold-duotone',
      color: 'primary.main',
      bgColor: 'primary.lighter',
      link: paths.dashboard.medicine.root,
    },
    {
      title: 'Active Batches',
      value: data.kpi.activeBatches,
      icon: 'solar:box-minimalistic-bold-duotone',
      color: 'info.main',
      bgColor: 'info.lighter',
      link: paths.dashboard.batch.root,
    },
    {
      title: 'Near Expiry (<90d)',
      value: data.kpi.nearExpiryBatches,
      icon: 'solar:alarm-add-bold-duotone',
      color: 'warning.main',
      bgColor: 'warning.lighter',
      link: paths.dashboard.batch.root,
    },
    {
      title: 'Expired Stock',
      value: data.kpi.expiredBatches,
      icon: 'solar:danger-triangle-bold-duotone',
      color: 'error.main',
      bgColor: 'error.lighter',
      link: paths.dashboard.batch.root,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4">{tenant?.name || 'Pharmacy Dashboard'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {tenant?.dlNumber ? `DL No: ${tenant.dlNumber}` : 'Welcome to your pharmacy operations center'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 2, md: 0 } }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.pos.root}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:cart-large-4-bold" />}
          >
            Open POS / Billing
          </Button>

          <Button
            component={RouterLink}
            href={paths.dashboard.medicine.root}
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            Add Medicine
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpis.map((kpi) => (
              <Grid key={kpi.title} xs={12} sm={6} md={3}>
                <Card
                  component={RouterLink}
                  href={kpi.link}
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.customShadows.z12,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="h3">{kpi.value}</Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {kpi.title}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: kpi.bgColor,
                      color: kpi.color,
                    }}
                  >
                    <Iconify icon={kpi.icon} width={32} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Near Expiry Batches & Recent Catalog */}
          <Grid container spacing={3}>
            {/* Near Expiry Batches Alert Table */}
            <Grid xs={12} lg={7}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Batches Expiring Soon"
                  subheader="Items with stock expiring within next 90 days"
                  action={
                    <Button component={RouterLink} href={paths.dashboard.batch.root} size="small" color="inherit">
                      View All Batches
                    </Button>
                  }
                />

                <Scrollbar>
                  <Table sx={{ minWidth: 500, mt: 1 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine Name</TableCell>
                        <TableCell>Batch No</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell align="right">Units Left</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.nearExpiryBatches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main', mb: 1, fontSize: 32 }} />
                            <Typography variant="body2">No batches expiring soon. Stock is healthy!</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.nearExpiryBatches.map((batch) => (
                          <TableRow key={batch._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2">{batch.medicine?.name || 'Medicine'}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {batch.medicine?.genericName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Label color="default">{batch.batchNumber}</Label>
                            </TableCell>
                            <TableCell>{fDate(batch.expiryDate)}</TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" color="warning.main">
                                {batch.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Label color="warning">Expiring Soon</Label>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </Card>
            </Grid>

            {/* Recently Added Medicines */}
            <Grid xs={12} lg={5}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Recent Medicines"
                  subheader="Latest entries in catalog"
                  action={
                    <Button component={RouterLink} href={paths.dashboard.medicine.root} size="small" color="inherit">
                      View Catalog
                    </Button>
                  }
                />

                <Scrollbar>
                  <Table sx={{ minWidth: 380, mt: 1 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name & Form</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="center">Schedule</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentMedicines.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No medicines added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.recentMedicines.map((med) => (
                          <TableRow key={med._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2">{med.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {med.dosageForm} • {med.unit}
                              </Typography>
                            </TableCell>
                            <TableCell>{med.category || 'General'}</TableCell>
                            <TableCell align="center">
                              <Label color={med.scheduleType === 'Schedule H1' || med.scheduleType === 'Schedule X' ? 'error' : 'info'}>
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
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
