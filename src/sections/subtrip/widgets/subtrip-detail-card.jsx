import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Box,
  Tab,
  Grid,
  Tabs,
  Card,
  Paper,
  Stack,
  Tooltip,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { wrapText } from 'src/utils/change-case';
import { fCurrency } from 'src/utils/format-number';
import { calculateDriverSalaryPerSubtrip } from 'src/utils/utils';

import { Iconify } from 'src/components/iconify';

export const SubtripDetailCard = ({ selectedSubtrip, commissionRate }) => {
  const [activeTab, setActiveTab] = useState(0);

  const {
    loadingWeight,
    invoiceNo,
    shipmentNo,
    consignee,
    orderNo,
    materialType,
    grade,
    diNumber,
  } = selectedSubtrip;

  const {
    freightModel = 'per_ton',
    rate: freightDetailsRate,
    freightAmount: serverFreightAmount,
  } = selectedSubtrip?.freightDetails || {};
  const rate = freightDetailsRate ?? 0;

  const formatRateValue = (value) => {
    const formatted = fCurrency(value || 0);
    switch (freightModel) {
      case 'per_ton':
        return `${formatted} / Ton`;
      case 'per_kl':
        return `${formatted} / KL`;
      case 'per_km':
        return `${formatted} / KM`;
      case 'per_hour':
        return `${formatted} / Hr`;
      case 'fixed':
        return `${formatted} (Fixed)`;
      case 'hybrid':
        return `${formatted} (Hybrid)`;
      default:
        return formatted;
    }
  };

  const getFreightAmountCaption = () => {
    switch (freightModel) {
      case 'per_ton':
        return `Rate: ₹${rate || 0} × Weight: ${loadingWeight || 0} Ton`;
      case 'per_kl':
        return `Rate: ₹${rate || 0} × Volume: ${loadingWeight || 0} KL`;
      case 'per_km': {
        const startKm = selectedSubtrip.freightDetails?.startKm || 0;
        const endKm = selectedSubtrip.freightDetails?.endKm || 0;
        const diff = endKm > startKm ? endKm - startKm : 0;
        return `Rate: ₹${rate || 0} × Distance: ${diff} KM`;
      }
      case 'per_hour': {
        let diffInHours = 0;
        if (selectedSubtrip.startDate && selectedSubtrip.endDate) {
          const start = new Date(selectedSubtrip.startDate).getTime();
          const end = new Date(selectedSubtrip.endDate).getTime();
          diffInHours = Math.ceil((end - start) / (1000 * 60 * 60));
        }
        return `Rate: ₹${rate || 0} × Time: ${diffInHours} Hour(s)`;
      }
      case 'fixed':
        return 'Fixed Freight';
      case 'hybrid':
        return 'Hybrid Billing';
      default:
        return `Rate: ₹${rate || 0} × Weight: ${loadingWeight || 0} Ton`;
    }
  };

  // Calculate financial metrics
  const calculateFinancials = () => {
    if (!selectedSubtrip)
      return {
        freightAmount: 0,
        expenses: 0,
        driverSalary: 0,
      };

    // Calculate freightAmount (server calculated amount or rate * loadingWeight)
    const freightAmount = serverFreightAmount ?? (rate || 0) * (loadingWeight || 0);

    // Calculate total expenses
    const expenses =
      selectedSubtrip.expenses?.reduce((total, expense) => total + (expense.amount || 0), 0) || 0;

    // Calculate driver salary
    const driverSalary = calculateDriverSalaryPerSubtrip(selectedSubtrip);

    return {
      freightAmount,
      expenses,
      driverSalary,
    };
  };

  const { freightAmount, expenses, driverSalary } = calculateFinancials();

  // Check if vehicle is owned
  const isOwn = selectedSubtrip?.vehicleId?.isOwn || false;
  const vehicleType = selectedSubtrip?.vehicleId?.vehicleType || '';

  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render the basic info tab content
  const renderBasicInfoTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Loading Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {freightModel === 'per_kl' ? 'Loading Volume' : 'Loading Weight'}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {loadingWeight || 0} {freightModel === 'per_kl' ? 'KL' : 'Ton'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Freight Rate</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatRateValue(rate)}
                </Typography>
              </Box>
              {!isOwn && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Effective Rate</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {formatRateValue(rate - commissionRate)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Document Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Invoice No</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {invoiceNo || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shipment No</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {shipmentNo || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Order No</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {orderNo || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">DI Number</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {diNumber || '-'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Material Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Consignee</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {consignee || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Material Type</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {materialType || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Grade</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {grade || '-'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render the trip details tab content
  const renderTripDetailsTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Vehicle & Driver
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Vehicle</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedSubtrip.vehicleId?.vehicleNo || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Driver</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedSubtrip.driverId?.driverName || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Vehicle Type</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {vehicleType || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Ownership</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {isOwn ? 'Owned' : 'Hired'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Customer & Route
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Customer</Typography>
                <Tooltip title={selectedSubtrip?.customerId?.customerName}>
                  <Typography variant="body2" fontWeight="bold">
                    {wrapText(selectedSubtrip?.customerId?.customerName || '-', 20)}
                  </Typography>
                </Tooltip>
              </Box>

              {/* Loading Point */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Loading Point</Typography>
                <Tooltip title={selectedSubtrip?.loadingPoint}>
                  <Typography variant="body2" fontWeight="bold">
                    {wrapText(selectedSubtrip?.loadingPoint || '-', 20)}
                  </Typography>
                </Tooltip>
              </Box>
              {/* UnLoading Point */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">UnLoading Point</Typography>
                <Tooltip title={selectedSubtrip?.unloadingPoint}>
                  <Typography variant="body2" fontWeight="bold">
                    {wrapText(selectedSubtrip?.unloadingPoint || '-', 20)}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render the financial summary tab content
  const renderFinancialSummaryTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
            borderRadius: 1,
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="mdi:cash-plus" sx={{ color: 'success.main' }} />
            <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
              Freight Amount
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: 'success.dark' }}>
            {fCurrency(freightAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getFreightAmountCaption()}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'error.lighter',
            border: '1px solid',
            borderColor: 'error.light',
            borderRadius: 1,
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="mdi:cash-minus" sx={{ color: 'error.main' }} />
            <Typography variant="subtitle2" sx={{ color: 'error.dark' }}>
              Expenses
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: 'error.dark' }}>
            {fCurrency(expenses)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedSubtrip.expenses?.length || 0} expense entries
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderColor: 'primary.light',
            borderRadius: 1,
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="mdi:account-cash" sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ color: 'primary.dark' }}>
              Driver Salary
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: 'primary.dark' }}>
            {fCurrency(driverSalary || 0)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Driver: {selectedSubtrip.driverId?.driverName || '-'}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Paper
      elevation={0}
      sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:truck-fast-outline" sx={{ color: 'primary.main' }} />
          Job Data
        </Typography>
        <Tooltip title="Edit Details">
          <IconButton
            color="default"
            onClick={() => {
              navigate(paths.dashboard.subtrip.edit(selectedSubtrip._id));
            }}
          >
            <Iconify icon="mdi:pencil" />
          </IconButton>
        </Tooltip>
      </Stack>

      {selectedSubtrip ? (
        <Box>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Trip Details" />
            <Tab label="Financial Summary" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderBasicInfoTab()}
            {activeTab === 1 && renderTripDetailsTab()}
            {activeTab === 2 && renderFinancialSummaryTab()}
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          Select a subtrip to view details
        </Typography>
      )}
    </Paper>
  );
};
