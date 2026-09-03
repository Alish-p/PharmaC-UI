import { useNavigate } from 'react-router';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { HeroHeader } from 'src/components/hero-header-card';

import { VendorAnalyticsWidget } from '../widgets/vendor-analytics-widget';
import { VendorRecentOrdersWidget } from '../widgets/vendor-recent-orders-widget';
import { VendorPurchaseOrdersWidget } from '../widgets/vendor-purchase-orders-widget';

// ----------------------------------------------------------------------

const VALID_TABS = ['overview', 'purchaseOrders'];

export function VendorDetailView({ vendor }) {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { name, phone, address, bankDetails, gstNumber } = vendor || {};

  // Read tab from URL, fallback to 'overview'
  const currentTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    return VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  }, [searchParams]);

  const handleChangeTab = useCallback(
    (_event, newValue) => {
      const next = new URLSearchParams(searchParams);
      if (newValue === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', newValue);
      }
      const qs = next.toString();
      navigate(qs ? `?${qs}` : '.', { replace: true });
    },
    [searchParams, navigate]
  );

  const handleViewMoreOrders = useCallback(() => {
    handleChangeTab(null, 'purchaseOrders');
  }, [handleChangeTab]);

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={name}
        status="Active"
        icon="mdi:account-tie"
        meta={[
          { icon: 'mdi:phone', label: phone },
          { icon: 'mdi:map-marker', label: address },
        ]}
        actions={[
          {
            label: 'Edit',
            icon: 'solar:pen-bold',
            onClick: () => navigate(paths.dashboard.vendor.edit(vendor._id)),
          },
        ]}
      />

      <Tabs value={currentTab} onChange={handleChangeTab} sx={{ my: { xs: 3, md: 2 } }}>
        <Tab value="overview" label="Overview" icon={<Iconify icon="mdi:eye" width={20} />} />
        <Tab
          value="purchaseOrders"
          label="Purchase Orders"
          icon={<Iconify icon="solar:document-bold-duotone" width={20} />}
        />
      </Tabs>

      {currentTab === 'overview' && (
        <>
          {/* Analytics Summary Cards */}
          <Box sx={{ mb: 3 }}>
            <VendorAnalyticsWidget vendorId={vendor._id} />
          </Box>

          <Grid container spacing={3}>
            {/* Vendor Details */}
            <Grid xs={12} md={6}>
              <Card>
                <CardHeader title="Vendor Details" />
                <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                  <DetailRow label="Name" value={name} />
                  <DetailRow label="Phone" value={phone} />
                  <DetailRow label="Address" value={address} multiline />
                  <DetailRow label="GST Number" value={gstNumber} />
                </Stack>
              </Card>
            </Grid>

            {/* Bank Details */}
            <Grid xs={12} md={6}>
              <Card>
                <CardHeader title="Bank Details" />
                <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                  <DetailRow label="Bank Name" value={bankDetails?.name} />
                  <DetailRow label="Branch" value={bankDetails?.branch} />
                  <DetailRow label="IFSC" value={bankDetails?.ifsc} />
                  <DetailRow label="Place" value={bankDetails?.place} />
                  <DetailRow label="Account No" value={bankDetails?.accNo} />
                </Stack>
              </Card>
            </Grid>

            {/* Recent Purchase Orders */}
            <Grid xs={12}>
              <VendorRecentOrdersWidget vendorId={vendor._id} onViewMore={handleViewMoreOrders} />
            </Grid>
          </Grid>
        </>
      )}

      {currentTab === 'purchaseOrders' && <VendorPurchaseOrdersWidget vendorId={vendor._id} />}
    </DashboardContent>
  );
}

function DetailRow({ label, value, multiline }) {
  return (
    <Stack direction="row" alignItems={multiline ? 'flex-start' : 'center'} spacing={1.5}>
      <Box
        component="span"
        sx={{ color: 'text.secondary', width: 180, flexShrink: 0, typography: 'subtitle2' }}
      >
        {label}
      </Box>
      <Typography sx={{ flexGrow: 1 }}>{value || '-'}</Typography>
    </Stack>
  );
}
