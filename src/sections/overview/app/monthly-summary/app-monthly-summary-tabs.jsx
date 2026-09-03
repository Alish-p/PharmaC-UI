import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSystemFeatures } from 'src/hooks/use-system-features';

import { CONFIG } from 'src/config-global';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { SvgColor } from 'src/components/svg-color';
import { CustomTabs } from 'src/components/custom-tabs';

import { DriverInsightsTable } from './app-driver-insights-table';
import { CustomerFreightTable } from './app-customer-freight-table';
import { VehicleInsightsTable } from './app-vehicle-insights-table';
import { TransporterInsightsTable } from './app-transporter-insights-table';
import { AppDestinationInsightsTable } from './app-destination-insights-table';

export function AppMonthlySummaryTabs() {
  const theme = useTheme();
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const [tab, setTab] = useState('customer');
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const monthParam = useMemo(() => selectedMonth?.format('YYYY-MM'), [selectedMonth]);

  // Track which tabs have been opened to control initial mounting/fetching
  const [mounted, setMounted] = useState({
    customer: true,
    vehicle: false,
    transporter: false,
    driver: false,
    destination: false,
  });

  const handleChange = (_e, value) => {
    setTab(value);
    setMounted((prev) => (prev[value] ? prev : { ...prev, [value]: true }));
  };

  const icon = (name) => (
    <SvgColor
      sx={{ width: 36, height: 36, color: 'primary.main' }}
      src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`}
    />
  );

  const tabs = useMemo(() => {
    const baseTabs = [
      { value: 'customer', label: 'Customer', icon: icon('ic_customer') },
      { value: 'vehicle', label: 'Vehicle', icon: icon('ic_vehicle') },
      { value: 'transporter', label: 'Transporter', icon: icon('ic_transporter') },
      { value: 'driver', label: 'Driver', icon: icon('ic-user') },
      { value: 'destination', label: 'Destination', icon: icon('ic_map') },
    ];
    if (!managesMarketVehicles) {
      return baseTabs.filter((t) => t.value !== 'transporter');
    }
    return baseTabs;
  }, [managesMarketVehicles]);

  const renderHeader = (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            mb: 1,
            gap: 0.5,
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            typography: 'subtitle2',
          }}
        >
          Monthly summary
        </Box>
        <Box sx={{ typography: 'h4' }}>{selectedMonth.format('MMM YYYY')}</Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DatePicker
          label="Select month"
          views={['year', 'month']}
          openTo="month"
          value={selectedMonth}
          onChange={(value) => value && setSelectedMonth(value)}
          disableFuture
        />
      </Box>
    </Box>
  );

  const renderTabs = (
    <CustomTabs
      value={tab}
      onChange={handleChange}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{ my: 3, borderRadius: 2 }}
      slotProps={{
        indicator: { borderRadius: 1.5, boxShadow: theme.customShadows.z4 },
        tab: { p: 2.5 },
      }}
    >
      {tabs.map((t) => (
        <Tab
          key={t.value}
          value={t.value}
          label={
            <Box
              sx={{
                width: 1,
                display: 'flex',
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'center' },
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  display: { xs: 'none', md: 'inline-flex' },
                }}
              >
                {t.icon}
              </Box>
              <div>
                <Box
                  sx={{ gap: 0.5, display: 'flex', alignItems: 'center', typography: 'subtitle2' }}
                >
                  {t.label}
                </Box>
              </div>
            </Box>
          }
        />
      ))}
    </CustomTabs>
  );

  return (
    <Card>
      <Box sx={{ px: 3, pt: 3 }}>{renderHeader}</Box>
      <Box sx={{ px: 3 }}>{renderTabs}</Box>

      <Box sx={{ px: 2, pb: 3 }}>
        {tab === 'customer' && (
          <CustomerFreightTable
            month={monthParam}
            title="📦 Customer-wise Summary"
            subheader="Shows total weight transferred and freight amount for each customer."
          />
        )}

        {tab === 'vehicle' && mounted.vehicle && (
          <VehicleInsightsTable
            month={monthParam}
            title="🚚 Vehicle Insights"
            subheader="Jobs completed by each vehicle"
          />
        )}

        {tab === 'transporter' && mounted.transporter && (
          <TransporterInsightsTable
            month={monthParam}
            title="🚛 Transporter Insights"
            subheader="Jobs completed by each transporter"
          />
        )}

        {tab === 'driver' && mounted.driver && (
          <DriverInsightsTable
            month={monthParam}
            title="👷 Driver Insights"
            subheader="Jobs completed by each driver"
          />
        )}

        {tab === 'destination' && mounted.destination && (
          <AppDestinationInsightsTable
            month={monthParam}
            title="📍 Destination Insights"
            subheader="Jobs completed by destination"
          />
        )}

        {/* Route tab removed; backend API removed */}
      </Box>
    </Card>
  );
}

export default AppMonthlySummaryTabs;
