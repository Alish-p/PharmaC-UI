import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomTabs } from 'src/components/custom-tabs';
import { HeroHeader } from 'src/components/hero-header-card';

import { PartLocationOverviewTab } from '../part-location-details/part-location-overview-tab';
import { PartLocationInventoryActivityTab } from '../part-location-details/part-location-inventory-activity-tab';

export function PartLocationDetailView({ partLocation }) {
  const { _id: locationId, name, address } = partLocation || {};

  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={name}
        status="Active"
        icon="mdi:warehouse"
        meta={[{ icon: 'mdi:map-marker', label: address }]}
      />

      <Box sx={{ mt: 3 }}>
        <CustomTabs
          value={currentTab}
          onChange={(_event, value) => setCurrentTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ mb: 3, borderRadius: 1, boxShadow: 1 }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="activity" label="Activity" />
        </CustomTabs>

        {currentTab === 'overview' && <PartLocationOverviewTab partLocation={partLocation} />}

        {currentTab === 'activity' && (
          <PartLocationInventoryActivityTab locationId={locationId} locationName={name} />
        )}
      </Box>
    </DashboardContent>
  );
}
