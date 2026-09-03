import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';

import { useTyreStatsByPart } from 'src/query/use-tyre';

import { Iconify } from 'src/components/iconify';

import { PartStockTransferDialog } from './part-stock-transfer-dialog';
import { PartStockAdjustmentDialog } from './part-stock-adjustment-dialog';

export function PartOverviewTab({
  partId,
  name,
  partNumber,
  category,
  manufacturer,
  description,
  unitCost,
  measurementUnit,
  quantity,
  inventoryLocation,
  locations = [],
  photo,
}) {
  const isTyre = category === 'Tires';
  const { data: tyreStats, isLoading: statsLoading } = useTyreStatsByPart(isTyre ? partId : null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const handleOpenAdjustDialog = useCallback((location) => {
    setSelectedLocation(location);
    setAdjustDialogOpen(true);
  }, []);

  const handleCloseAdjustDialog = useCallback(() => {
    setAdjustDialogOpen(false);
    setSelectedLocation(null);
  }, []);

  const handleOpenTransferDialog = useCallback((location) => {
    setSelectedLocation(location);
    setTransferDialogOpen(true);
  }, []);

  const handleCloseTransferDialog = useCallback(() => {
    setTransferDialogOpen(false);
    setSelectedLocation(null);
  }, []);

  const partForDialog = {
    name,
    partNumber,
    description,
    measurementUnit,
  };

  return (
    <>
      <Grid container spacing={3}>
        {photo && (
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 1 }}>
              <Box
                component="img"
                alt={name || partNumber}
                src={photo}
                sx={{
                  width: 1,
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={photo ? 8 : 6}>
          <Card>
            <CardHeader title="Part Details" />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
              <DetailRow label="Part Number" value={partNumber} />
              <DetailRow label="Name" value={name} />
              <DetailRow label="Category" value={category} />
              <DetailRow label="Manufacturer" value={manufacturer} />
              <DetailRow label="Measurement Unit" value={measurementUnit} />
              <DetailRow label="Quantity" value={quantity} />
              <DetailRow
                label="Unit Cost"
                value={unitCost != null ? `₹ ${Number(unitCost).toFixed(2)}` : undefined}
              />
              <DetailRow label="Location" value={inventoryLocation?.name} />
              <DetailRow label="Description" value={description} multiline />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={photo ? 12 : 6}>
          {isTyre ? (
            <Card>
              <CardHeader title="Tyre Inventory (from Tyre Module)" />
              <Box sx={{ p: 2.5, pb: 2 }}>
                {statsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading tyre stats...
                  </Typography>
                ) : (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    divider={
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: 'none', sm: 'block' }, borderStyle: 'dashed' }}
                      />
                    }
                    spacing={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <LocationMetric label="Total Tyres" value={tyreStats?.all?.count || 0} />
                    <LocationMetric
                      label="In Stock"
                      value={tyreStats?.In_Stock?.count || 0}
                      highlightPositive
                    />
                    <LocationMetric
                      label="Mounted"
                      value={tyreStats?.Mounted?.count || 0}
                      highlightPositive
                    />
                    <LocationMetric label="Scrapped" value={tyreStats?.Scrapped?.count || 0} />
                  </Stack>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Note: Inventory for tyres is managed entirely within the Tyre module. Standard
                    inventory locations are ignored.
                  </Typography>
                </Box>
              </Box>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Locations" />
              <Box sx={{ p: 2.5, pb: 2 }}>
                {locations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No locations configured for this part.
                  </Typography>
                ) : (
                  <Stack spacing={2.5}>
                    {locations.map((location) => (
                      <LocationItem
                        key={location.id || location.name}
                        location={location}
                        onAdjustInventory={() => handleOpenAdjustDialog(location)}
                        onTransferInventory={() => handleOpenTransferDialog(location)}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      <PartStockAdjustmentDialog
        open={adjustDialogOpen}
        onClose={handleCloseAdjustDialog}
        part={partForDialog}
        location={selectedLocation}
        partId={partId}
      />

      <PartStockTransferDialog
        open={transferDialogOpen}
        onClose={handleCloseTransferDialog}
        part={partForDialog}
        fromLocation={selectedLocation}
        locations={locations}
        partId={partId}
      />
    </>
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

function LocationItem({ location, onAdjustInventory, onTransferInventory }) {
  const { name, address, currentQty, reorderPoint, pendingPoQty, workOrderQty } = location || {};

  return (
    <Box
      sx={(theme) => ({
        p: 2.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Stack
        direction="row"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" color="primary.main">
            {name || 'Unnamed location'}
          </Typography>
          {address && (
            <Typography variant="caption" color="text.secondary">
              {address}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Adjust inventory">
              <Button onClick={onAdjustInventory}>
                <Iconify icon="mdi:plus-minus-variant" width={18} />
              </Button>
            </Tooltip>
            <Tooltip title="Transfer">
              <Button onClick={onTransferInventory}>
                <Iconify icon="mdi:swap-horizontal" width={18} />
              </Button>
            </Tooltip>
            <Tooltip title="Purchase">
              <Button>
                <Iconify icon="mdi:cart-outline" width={18} />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Stack>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', sm: 'block' }, borderStyle: 'dashed' }}
          />
        }
        spacing={2}
      >
        <LocationMetric label="Current Qty" value={currentQty} />
        <LocationMetric label="Reorder Point" value={reorderPoint} />
        <LocationMetric label="Pending PO Qty" value={pendingPoQty} highlightPositive />
        <LocationMetric label="WO Current Qty" value={workOrderQty} highlightPositive />
      </Stack>
    </Box>
  );
}

function LocationMetric({ label, value, highlightPositive, isCurrency }) {
  const isNumber = typeof value === 'number';
  const displayValue = value ?? '-';

  return (
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          mb: 0.5,
          display: 'inline-block',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          mt: 0.5,
          color: highlightPositive && isNumber && value > 0 ? 'success.main' : 'text.secondary',
        }}
      >
        {isCurrency && isNumber ? `₹ ${value.toFixed(2)}` : displayValue}
      </Typography>
    </Box>
  );
}
