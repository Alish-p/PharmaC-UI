import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TenantForm from '../tenant-form';
import PumpSettingForm from '../pump/pump-setting-form';
import ExpenseSettingForm from '../expense/expense-setting-form';
import VehicleSettingForm from '../vehicle/vehicle-setting-form';
import InvoiceSettingForm from '../invoice/invoice-setting-form';
import CustomerSettingForm from '../customer/customer-setting-form';
import SubtripSettingForm from '../subtrip-config/subtrip-setting-form';
import TransporterSettingForm from '../transporter/transporter-setting-form';

// ----------------------------------------------------------------------

const SETTINGS_ITEMS = [
  {
    id: 'tenant',
    label: 'Company Setting',
    icon: <Iconify icon="solar:user-id-bold" />,
  },
  {
    id: 'subtrip',
    label: 'Subtrip',
    icon: <Iconify icon="mdi:bookmark" />,
  },
  {
    id: 'expense',
    label: 'Expense',
    icon: <Iconify icon="solar:bill-list-bold" />,
  },
  {
    id: 'pump',
    label: 'Pump',
    icon: <Iconify icon="mdi:gas-station" />,
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    icon: <Iconify icon="mdi:truck" />,
  },
  {
    id: 'driver',
    label: 'Driver',
    icon: <Iconify icon="mdi:account-tie-hat" />,
  },
  {
    id: 'transporter',
    label: 'Transporter',
    icon: <Iconify icon="mdi:truck-fast" />,
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: <Iconify icon="mdi:account-group" />,
  },
  {
    id: 'invoice',
    label: 'Invoice',
    icon: <Iconify icon="mdi:file-document-outline" />,
  },
];

// ----------------------------------------------------------------------

export function SettingsView({ tenant }) {
  const theme = useTheme();

  const [selectedItem, setSelectedItem] = useState('tenant');

  const handleSelectedItemsChange = useCallback((event, itemId) => {
    if (itemId) {
      setSelectedItem(itemId);
    }
  }, []);

  const renderContent = () => {
    switch (selectedItem) {
      case 'tenant':
        return <TenantForm currentTenant={tenant} />;
      case 'subtrip':
        return <SubtripSettingForm />;
      case 'expense':
        return <ExpenseSettingForm currentTenant={tenant} />;
      case 'pump':
        return <PumpSettingForm currentTenant={tenant} />;
      case 'vehicle':
        return <VehicleSettingForm currentTenant={tenant} />;
      case 'driver':
        return <p>Sample Driver Settings</p>;
      case 'transporter':
        return <TransporterSettingForm currentTenant={tenant} />;
      case 'customer':
        return <CustomerSettingForm currentTenant={tenant} />;
      case 'invoice':
        return <InvoiceSettingForm currentTenant={tenant} />;
      default:
        return null;
    }
  };

  const renderTreeItems = (items) =>
    items.map((item) => (
      <TreeItem
        key={item.id}
        itemId={item.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            {item.icon && (
              <Box component="span" sx={{ display: 'flex' }}>
                {item.icon}
              </Box>
            )}
            <Box component="span" sx={{ typography: 'body2' }}>
              {item.label}
            </Box>
          </Box>
        }
      >
        {item.children && renderTreeItems(item.children)}
      </TreeItem>
    ));

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Company Settings"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Company Settings' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card
        sx={{
          mb: 3,
          minHeight: 600,
          display: { md: 'flex' },
        }}
      >
        <Box
          sx={{
            p: 2,
            width: { xs: 1, md: 280 },
            flexShrink: 0,
            borderRight: { md: `solid 1px ${theme.vars.palette.divider}` },
            borderBottom: { xs: `solid 1px ${theme.vars.palette.divider}`, md: 'none' },
          }}
        >
          <SimpleTreeView
            onSelectedItemsChange={handleSelectedItemsChange}
            selectedItems={selectedItem}
          >
            {renderTreeItems(SETTINGS_ITEMS)}
          </SimpleTreeView>
        </Box>

        <Box
          sx={{
            p: 3,
            width: 1,
            overflow: 'auto',
          }}
        >
          {renderContent()}
        </Box>
      </Card>
    </DashboardContent>
  );
}
