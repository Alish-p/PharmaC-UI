import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { ICONS } from 'src/assets/data/icons';
import { useGetTyreHistory, useUpdateTyreHistory } from 'src/query/use-tyre';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import TyreHistoryUpdateDialog from '../components/tyre-history-update-dialog';

// ----------------------------------------------------------------------

export const TYRE_HISTORY_ACTION = {
  THREAD_UPDATE: 'THREAD_UPDATE',
  MOUNT: 'MOUNT',
  UNMOUNT: 'UNMOUNT',
  UPDATE: 'UPDATE',
  SCRAP: 'SCRAP',
  REMOLD: 'REMOLD',
  REJECT: 'REJECT',
  SELL: 'SELL',
};

export default function TyreHistory({ tyreId, ...other }) {
  const { data: history, isLoading } = useGetTyreHistory(tyreId);
  const updateHistory = useUpdateTyreHistory();

  const [filter, setFilter] = useState('ALL');
  const [editItem, setEditItem] = useState(null);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredHistory = history?.filter((item) => {
    if (filter === 'ALL') return true;
    return item.action === filter;
  });

  const handleUpdate = async (data) => {
    try {
      await updateHistory.mutateAsync({
        id: tyreId,
        historyId: editItem._id,
        data,
      });
      toast.success('History updated successfully');
      setEditItem(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update history');
    }
  };

  return (
    <Card {...other}>
      <CardHeader
        title="Tyre History"
        action={
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filter}
              onChange={handleFilterChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Filter Activity' }}
            >
              <MenuItem value="ALL">All Activity</MenuItem>
              {Object.values(TYRE_HISTORY_ACTION).map((action) => (
                <MenuItem key={action} value={action}>
                  {action.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />

      {isLoading && <Box sx={{ p: 3, textAlign: 'center' }}>Loading history...</Box>}

      {!isLoading && (!filteredHistory || filteredHistory.length === 0) && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No history available</Box>
      )}

      {filteredHistory && filteredHistory.length > 0 && (
        <Scrollbar sx={{ height: 420 }}>
          <Timeline
            sx={{
              m: 0,
              p: 3,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {filteredHistory.map((item, index) => (
              <HistoryItem
                key={item._id}
                item={item}
                lastItem={index === filteredHistory.length - 1}
                onEdit={() => setEditItem(item)}
              />
            ))}
          </Timeline>
        </Scrollbar>
      )}

      <TyreHistoryUpdateDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
        historyItem={editItem}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function HistoryItem({ item, lastItem, onEdit }) {
  const {
    action,
    measuringDate,
    vehicleId,
    position,
    odometer,
    newThreadDepth,
    previousThreadDepth,
    distanceCovered,
  } = item;

  const renderContent = () => {
    switch (action) {
      case 'MOUNT':
        return `Mounted on ${vehicleId?.vehicleNo || 'Unknown Vehicle'} at position ${position}. Odometer: ${odometer} km`;
      case 'UNMOUNT':
        return (
          <>
            Unmounted. Odometer: {odometer} km.
            {distanceCovered != null && (
              <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', ml: 0.5 }}>
                Distance Covered: +{distanceCovered} km
              </Box>
            )}
          </>
        );
      case 'THREAD_UPDATE': {
        let threadUpdateText = `Thread depth updated from ${previousThreadDepth}mm to ${newThreadDepth}mm`;
        if (odometer) {
          threadUpdateText += ` at ${odometer} km`;
        }
        return threadUpdateText;
      }
      case 'UPDATE':
        return `Tyre details updated`;
      case 'SCRAP':
        if (vehicleId) {
          return (
            <>
              Moved to Scrap from {vehicleId?.vehicleNo || 'Unknown Vehicle'} at position {position}
              . Odometer: {odometer} km.
              {distanceCovered != null && (
                <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', ml: 0.5 }}>
                  Distance Covered: +{distanceCovered} km
                </Box>
              )}
            </>
          );
        }
        return `Moved to Scrap`;
      case 'REMOLD':
        return `Tyre remolded. Thread depth reset to ${newThreadDepth}mm from ${previousThreadDepth}mm`;
      case 'REJECT':
        return `Tyre marked as Rejected`;
      case 'SELL': {
        const price = item.metadata?.sellPrice || 0;
        let soldText = `Sold at ₹${price}`;
        const soldToName = item.metadata?.soldToTransporterName || item.metadata?.soldTo;
        if (soldToName) {
          soldText = `Sold to ${soldToName} at ₹${price}`;
        }
        return soldText;
      }
      default:
        return action;
    }
  };

  const getColor = () => {
    switch (action) {
      case 'MOUNT':
        return 'success';
      case 'UNMOUNT':
        return 'warning';
      case 'THREAD_UPDATE':
        return 'info';
      case 'SCRAP':
        return 'error';
      case 'REJECT':
        return 'error';
      case 'REMOLD':
        return 'warning'; // or 'success' or 'info'
      case 'SELL':
        return 'success';
      default:
        return 'primary';
    }
  };

  const canEdit = action === 'MOUNT' || action === 'UNMOUNT' || action === 'SCRAP';

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={getColor()} />
        {lastItem ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">{renderContent()}</Typography>

          {canEdit && (
            <IconButton size="small" onClick={onEdit}>
              <Iconify icon={ICONS.common.edit} width={16} />
            </IconButton>
          )}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fDateTime(measuringDate)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}
