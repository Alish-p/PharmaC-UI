import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { HeroHeader } from 'src/components/hero-header-card';

import { PartOverviewTab } from '../part-details/part-overview-tab';
import { PartPriceHistoryTab } from '../part-details/part-price-history-tab';
import { PartInventoryActivityTab } from '../part-details/part-inventory-activity-tab';

export function PartDetailView({ part }) {
  const {
    _id: partId,
    name,
    partNumber,
    category,
    manufacturer,
    description,
    unitCost,
    measurementUnit,
    quantity,
    inventoryLocation,
    inventory,
    locations: partLocations,
    isActive,
  } = part || {};

  const [currentTab, setCurrentTab] = useState('overview');

  const inventoryEntries = Array.isArray(inventory) ? inventory : [];

  const inventoryLocations =
    inventoryEntries.length > 0
      ? inventoryEntries.map((entry) => {
          const loc = entry.inventoryLocation || {};

          return {
            id: entry._id || loc._id || loc.id || loc.name,
            inventoryLocationId: loc._id || loc.id || loc.name,
            name: loc.name,
            address: loc.address,
            currentQty: entry.quantity,
            reorderPoint: entry.threshold,
            pendingPoQty: entry.pendingPoQty,
            workOrderQty: entry.workOrderQty,
            averageUnitCost: entry.averageUnitCost,
          };
        })
      : [];

  const locations =
    partLocations && Array.isArray(partLocations) && partLocations.length
      ? partLocations
      : inventoryLocations.length
        ? inventoryLocations
        : inventoryLocation
          ? [
              {
                id: inventoryLocation.id || inventoryLocation._id || inventoryLocation.name,
                inventoryLocationId:
                  inventoryLocation.id || inventoryLocation._id || inventoryLocation.name,
                name: inventoryLocation.name,
                currentQty: quantity,
                reorderPoint: inventoryLocation.reorderPoint,
                pendingPoQty: inventoryLocation.pendingPoQty,
                workOrderQty: inventoryLocation.workOrderQty,
              },
            ]
          : [];

  const totalQuantity =
    typeof quantity === 'number' && !Number.isNaN(quantity)
      ? quantity
      : inventoryEntries.reduce(
          (sum, entry) => sum + (typeof entry.quantity === 'number' ? entry.quantity : 0),
          0
        );

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={name || partNumber}
        status={isActive ? 'Active' : 'In-Active'}
        icon="mdi:cog-outline"
        meta={[
          { icon: 'mdi:format-list-numbered', label: partNumber },
          { icon: 'mdi:label-outline', label: category },
          { icon: 'mdi:factory', label: manufacturer },
        ]}
      />

      <Box sx={{ mt: 3 }}>
        <CustomTabs
          value={currentTab}
          onChange={(_event, value) => setCurrentTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ mb: 3, borderRadius: 1, boxShadow: 1 }}
        >
          <Tab
            icon={<Iconify icon="mdi:information-outline" />}
            value="overview"
            label="Overview"
          />
          <Tab
            icon={<Iconify icon="mdi:history" />}
            value="inventoryActivity"
            label="Inventory Activity"
          />
          <Tab
            icon={<Iconify icon="mdi:currency-inr" />}
            value="purchaseHistory"
            label="Price History"
          />
        </CustomTabs>

        {currentTab === 'overview' && (
          <PartOverviewTab
            partId={partId}
            name={name}
            partNumber={partNumber}
            category={category}
            manufacturer={manufacturer}
            description={description}
            unitCost={unitCost}
            measurementUnit={measurementUnit}
            quantity={totalQuantity}
            inventoryLocation={inventoryLocation}
            locations={locations}
            photo={part?.photo}
          />
        )}

        {currentTab === 'inventoryActivity' && <PartInventoryActivityTab partId={partId} />}

        {currentTab === 'purchaseHistory' && (
          <PartPriceHistoryTab
            partId={partId}
            currentAverageCost={part.averageUnitCost || part.unitCost}
          />
        )}
      </Box>
    </DashboardContent>
  );
}
