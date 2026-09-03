/* eslint-disable react/prop-types */
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { useCustomersSummary } from 'src/query/use-customer';

import { Iconify } from 'src/components/iconify';

import { FREIGHT_MODEL_OPTIONS } from '../constants';

// ----------------------------------------------------------------------

export default function SubtripTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedCustomerName,
  selectedVehicleNo,
  selectedDriverName,
  selectedTransporterName,
  ...other
}) {
  const { data: customers = [] } = useCustomersSummary();
  const handleRemoveSubtripStatus = (statusToRemove) => {
    const newStatuses = (filters.subtripStatus || []).filter((s) => s !== statusToRemove);
    onFilters('subtripStatus', newStatuses);
  };

  const handleRemoveCustomer = () => {
    onFilters('customerId', '');
  };

  const handleRemoveTransport = () => {
    onFilters('transportName', '');
  };

  const handleRemoveVehicleNo = () => {
    onFilters('vehicleNo', '');
  };

  const handleRemoveSubtripNo = () => {
    onFilters('subtripNo', '');
  };

  const handleRemoveReferenceSubtripNo = () => {
    onFilters('referenceSubtripNo', '');
  };

  const handleRemoveEwayBill = () => {
    onFilters('ewayBill', '');
  };

  const handleRemoveDate = () => {
    onFilters({ fromDate: null, toDate: null });
  };

  const handleRemoveEndDate = () => {
    onFilters({ subtripEndFromDate: null, subtripEndToDate: null });
  };

  const handleRemoveDriver = () => {
    onFilters('driverId', '');
  };

  const handleRemoveSubtripType = () => {
    onFilters('subtripType', '');
  };

  // Route filter removed

  const handleRemoveMaterials = (value) => {
    const newValues = filters.materials.filter((v) => v !== value);
    onFilters('materials', newValues);
  };

  const handleRemoveVehicleOwnership = () => {
    onFilters('vehicleOwnership', '');
  };

  const handleRemoveTransporterPaymentGenerated = () => {
    onFilters('transporterPaymentGenerated', '');
  };

  const handleRemoveEpodSigned = () => {
    onFilters('epodSigned', '');
  };

  const handleRemoveShortage = () => {
    onFilters('shortage', '');
  };

  const handleRemoveCommissionRateMin = () => {
    onFilters('commissionRateMin', '');
  };

  const handleRemoveCommissionRateMax = () => {
    onFilters('commissionRateMax', '');
  };

  const handleRemoveFreightModel = () => {
    onFilters('freightModel', '');
  };

  const handleRemoveLoadingPoint = () => {
    onFilters('loadingPoint', '');
  };

  const handleRemoveUnloadingPoint = () => {
    onFilters('unloadingPoint', '');
  };

  const shortLabel = fDateRangeShortLabel(filters.fromDate, filters.toDate);
  const resolvedCustomerName = (() => {
    if (selectedCustomerName) return selectedCustomerName;
    if (!filters.customerId) return '';
    const found = customers.find((c) => c._id === filters.customerId);
    return found?.customerName || '';
  })();

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.subtripStatus && filters.subtripStatus.length > 0 && (
          <Block label="Job Status :">
            {filters.subtripStatus.map((status) => (
              <Chip
                key={status}
                size="small"
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                onDelete={() => handleRemoveSubtripStatus(status)}
              />
            ))}
          </Block>
        )}

        {filters.customerId && (
          <Block label="Customer">
            <Chip
              size="small"
              label={resolvedCustomerName || filters.customerId}
              onDelete={handleRemoveCustomer}
            />
          </Block>
        )}

        {filters.transportName && (
          <Block label="Transporter">
            <Chip
              size="small"
              label={selectedTransporterName || filters.transportName}
              onDelete={handleRemoveTransport}
            />
          </Block>
        )}

        {filters.vehicleNo && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={selectedVehicleNo || filters.vehicleNo}
              onDelete={handleRemoveVehicleNo}
            />
          </Block>
        )}

        {filters.driverId && (
          <Block label="Driver:">
            <Chip
              size="small"
              label={selectedDriverName || filters.driverId}
              onDelete={handleRemoveDriver}
            />
          </Block>
        )}

        {/* Route filter removed */}

        {filters.subtripNo && (
          <Block label="Job No:">
            <Chip size="small" label={filters.subtripNo} onDelete={handleRemoveSubtripNo} />
          </Block>
        )}

        {filters.referenceSubtripNo && (
          <Block label="Reference Job No:">
            <Chip
              size="small"
              label={filters.referenceSubtripNo}
              onDelete={handleRemoveReferenceSubtripNo}
            />
          </Block>
        )}

        {filters.ewayBill && (
          <Block label="E-way Bill No:">
            <Chip size="small" label={filters.ewayBill} onDelete={handleRemoveEwayBill} />
          </Block>
        )}

        {filters.subtripType && (
          <Block label="Subtrip Type:">
            <Chip size="small" label={filters.subtripType} onDelete={handleRemoveSubtripType} />
          </Block>
        )}

        {filters.loadingPoint && (
          <Block label="Loading Point:">
            <Chip size="small" label={filters.loadingPoint} onDelete={handleRemoveLoadingPoint} />
          </Block>
        )}

        {filters.unloadingPoint && (
          <Block label="Unloading Point:">
            <Chip
              size="small"
              label={filters.unloadingPoint}
              onDelete={handleRemoveUnloadingPoint}
            />
          </Block>
        )}

        {filters.fromDate && filters.toDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {filters.subtripEndFromDate && filters.subtripEndToDate && (
          <Block label="End Date:">
            <Chip
              size="small"
              label={fDateRangeShortLabel(filters.subtripEndFromDate, filters.subtripEndToDate)}
              onDelete={handleRemoveEndDate}
            />
          </Block>
        )}

        {filters.materials && filters.materials.length > 0 && (
          <Block label="Materials:">
            {filters.materials.map((m) => (
              <Chip key={m} size="small" label={m} onDelete={() => handleRemoveMaterials(m)} />
            ))}
          </Block>
        )}

        {filters.vehicleOwnership && (
          <Block label="Vehicle Ownership:">
            <Chip
              size="small"
              label={filters.vehicleOwnership === 'Market' ? 'Market Jobs' : 'Own Jobs'}
              onDelete={handleRemoveVehicleOwnership}
            />
          </Block>
        )}

        {filters.transporterPaymentGenerated && (
          <Block label="Transporter Payment:">
            <Chip
              size="small"
              label={filters.transporterPaymentGenerated === 'yes' ? 'Yes' : 'No'}
              onDelete={handleRemoveTransporterPaymentGenerated}
            />
          </Block>
        )}

        {filters.epodSigned && (
          <Block label="Epod Signed:">
            <Chip
              size="small"
              label={filters.epodSigned === 'yes' ? 'Yes' : 'No'}
              onDelete={handleRemoveEpodSigned}
            />
          </Block>
        )}

        {filters.shortage && (
          <Block label="Shortage:">
            <Chip
              size="small"
              label={filters.shortage === 'yes' ? 'Has Shortage' : 'No shortage'}
              onDelete={handleRemoveShortage}
            />
          </Block>
        )}

        {(filters.commissionRateMin || filters.commissionRateMax) && (
          <Block label="Commission Rate:">
            {filters.commissionRateMin && (
              <Chip
                size="small"
                label={`> ${filters.commissionRateMin}`}
                onDelete={handleRemoveCommissionRateMin}
              />
            )}
            {filters.commissionRateMax && (
              <Chip
                size="small"
                label={`≤ ${filters.commissionRateMax}`}
                onDelete={handleRemoveCommissionRateMax}
              />
            )}
          </Block>
        )}
        {filters.freightModel && (
          <Block label="Freight Model:">
            <Chip
              size="small"
              label={
                FREIGHT_MODEL_OPTIONS.find((opt) => opt.value === filters.freightModel)?.label ||
                filters.freightModel
              }
              onDelete={handleRemoveFreightModel}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
