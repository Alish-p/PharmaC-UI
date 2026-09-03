import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime, fToNow, fDaysDuration } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import MiniTyreLayout from 'src/sections/vehicle/components/mini-tyre-layout';

import { TYRE_STATUS } from './tyre-constants';

// ----------------------------------------------------------------------

export const TYRE_TABLE_COLUMNS = [
  {
    id: 'serialNumber',
    label: 'Tyre Number',
    defaultVisible: true,
    disabled: true, // Always visible
    getter: (row) => row.serialNumber,
    render: (row) => (
      <ListItemText
        disableTypography
        primary={
          <Link
            component={RouterLink}
            to={paths.dashboard.tyre.details(row._id)}
            variant="body2"
            noWrap
            sx={{ color: 'primary.main', cursor: 'pointer' }}
          >
            {row.serialNumber}
          </Link>
        }
      />
    ),
    sortable: true,
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.currentVehicleId?.vehicleNo || '-',
    render: (row) =>
      row.currentVehicleId ? (
        <Link
          component={RouterLink}
          to={paths.dashboard.vehicle.details(row.currentVehicleId._id)}
          variant="body2"
          noWrap
          sx={{ color: 'primary', cursor: 'pointer' }}
        >
          {row.currentVehicleId.vehicleNo}
        </Link>
      ) : (
        '-'
      ),
  },
  {
    id: 'currentPosition',
    label: 'Position',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.currentPosition || '-',
    render: (row) =>
      row.currentVehicleId?.tyreLayoutId && row.currentPosition ? (
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <MiniTyreLayout
                layoutId={row.currentVehicleId.tyreLayoutId}
                currentPosition={row.currentPosition}
                disableTooltip
              />
            </Box>
          }
          arrow
          placement="right"
        >
          <Box
            component="span"
            sx={{
              cursor: 'help',
              borderBottom: '1px dashed',
              borderColor: 'text.disabled',
            }}
          >
            {row.currentPosition}
          </Box>
        </Tooltip>
      ) : (
        '-'
      ),
  },
  {
    id: 'currentKm',
    label: 'Last Recorded KM',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.currentKm,
    render: (row) => `${row.currentKm || 0} km`,
    sortable: true,
  },
  {
    id: 'liveKm',
    label: 'Live KM',
    defaultVisible: true,
    disabled: false,
    getter: (row) => {
      if (
        row.status === 'Mounted' &&
        row.currentVehicleId != null &&
        row.mountOdometer != null &&
        row.currentVehicleId.currentOdometer != null
      ) {
        const diff = row.currentVehicleId.currentOdometer - row.mountOdometer;
        return (row.currentKm || 0) + (diff > 0 ? diff : 0);
      }
      return row.currentKm || 0;
    },
    render: (row) => {
      if (
        row.status === 'Mounted' &&
        row.currentVehicleId != null &&
        row.mountOdometer != null &&
        row.currentVehicleId.currentOdometer != null
      ) {
        const diff = row.currentVehicleId.currentOdometer - row.mountOdometer;
        const liveKm = (row.currentKm || 0) + (diff > 0 ? diff : 0);

        const updatedAt = row.currentVehicleId.currentOdometerUpdatedAt;

        let subtitleColor = 'text.disabled';
        if (updatedAt) {
          const daysOld = fDaysDuration(updatedAt, new Date());
          if (daysOld < 3) subtitleColor = 'success.light';
          else if (daysOld <= 10) subtitleColor = 'warning.light';
          else subtitleColor = 'error.light';
        }

        const isMountAnomaly = row.mountOdometer > row.currentVehicleId.currentOdometer;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemText
              primary={`${liveKm} km`}
              secondary={updatedAt ? `${fToNow(updatedAt)} ago` : 'Unknown'}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                typography: 'caption',
                color: subtitleColor,
              }}
            />
            {isMountAnomaly && (
              <Tooltip
                title={
                  <Box>
                    <Box sx={{ fontWeight: 700, mb: 0.5 }}>
                      ⚠ Data Issue: Invalid Mount Odometer
                    </Box>
                    <Box>{`Mounted at ${row.mountOdometer} km, but vehicle's current odometer is ${row.currentVehicleId.currentOdometer} km.`}</Box>
                    <Box sx={{ mt: 0.5, opacity: 0.8 }}>
                      Mount point cannot be ahead of the vehicle&apos;s current reading.
                    </Box>
                  </Box>
                }
                placement="top"
                arrow
              >
                <Box
                  component="span"
                  sx={{ color: 'error.main', ml: 1, display: 'flex', cursor: 'help' }}
                >
                  <Iconify icon="mdi:alert-circle" width={16} />
                </Box>
              </Tooltip>
            )}
          </Box>
        );
      }
      return `${row.currentKm || 0} km`;
    },
    sortable: false,
  },
  {
    id: 'remoldKm',
    label: 'Remold Km',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      if (row.metadata?.remoldCount > 0) {
        return (row.currentKm || 0) - (row.metadata?.totalKmAtLastRemold || 0);
      }
      return '-';
    },
    render: (row) => {
      if (row.metadata?.remoldCount > 0) {
        const val = (row.currentKm || 0) - (row.metadata?.totalKmAtLastRemold || 0);
        return `${val} km`;
      }
      return '-';
    },
  },
  {
    id: 'brand',
    label: 'Brand',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.brand,
  },
  {
    id: 'model',
    label: 'Model',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.model,
  },
  {
    id: 'size',
    label: 'Size',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.size,
  },
  {
    id: 'type',
    label: 'Type',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.type,
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.status,
    render: (row) => {
      let label = row.status || '-';
      let color = 'default';

      if (row.status === TYRE_STATUS.IN_STOCK) {
        label = 'In Stock';
        color = 'success';
      } else if (row.status === TYRE_STATUS.MOUNTED) {
        label = 'Mounted';
        color = 'warning';
      } else if (row.status === TYRE_STATUS.SCRAPPED) {
        label = 'Scrapped';
        color = 'error';
      } else if (row.status === TYRE_STATUS.SOLD) {
        label = 'Sold';
        color = 'info';
      }

      return (
        <Label variant="soft" color={color}>
          {label}
        </Label>
      );
    },
    sortable: true,
  },
  {
    id: 'category',
    label: 'Category',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.category || '-',
  },

  {
    id: 'cost',
    label: 'Cost',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.cost,
    render: (row) => `₹ ${row.cost?.toFixed(2) || '0.00'}`,
    sortable: true,
  },
  {
    id: 'soldTo',
    label: 'Sold To',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.soldToTransporter?.transportName || '-',
  },
  {
    id: 'soldPrice',
    label: 'Sold Price',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.soldPrice,
    render: (row) => (row.soldPrice ? `₹ ${row.soldPrice.toFixed(2)}` : '-'),
    sortable: true,
  },
  {
    id: 'threadDepth',
    label: 'Thread Depth',
    defaultVisible: true,
    disabled: false,
    getter: (row) => `${row.threadDepth?.current || 0} / ${row.threadDepth?.original || 0} mm`,
    render: (row) => {
      const current = row.threadDepth?.current || 0;
      const original = row.threadDepth?.original || 0;
      let color = 'default';

      if (current >= 6) {
        color = 'success';
      } else if (current >= 4) {
        color = 'warning';
      } else {
        color = 'error';
      }

      const tooltipContent = (
        <Card sx={{ p: 2 }}>
          <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              component="span"
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }}
            />
            Good (&gt;= 6mm)
          </Box>
          <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              component="span"
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', mr: 1 }}
            />
            OK (4-5mm) - Inspect Monthly
          </Box>
          <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }}
            />
            Critical (&lt; 4mm) - Won&apos;t Last Long
          </Box>
        </Card>
      );

      return (
        <Tooltip title={tooltipContent} arrow placement="top">
          <Label variant="soft" color={color} sx={{ textTransform: 'none' }}>
            {`${current} / ${original} mm`}
          </Label>
        </Tooltip>
      );
    },
    sortable: true,
  },

  {
    id: 'createdAt',
    label: 'Added on',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.createdAt,
    render: (row) => (
      <ListItemText
        primary={fDate(row.createdAt)}
        secondary={fTime(row.createdAt)}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          typography: 'caption',
        }}
      />
    ),
    sortable: true,
  },
];
