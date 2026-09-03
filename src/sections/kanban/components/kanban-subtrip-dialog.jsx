import { useInView } from 'react-intersection-observer';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import { Stack, CircularProgress } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useDebounce } from 'src/hooks/use-debounce';

import { useInfiniteSubtripsByStatus } from 'src/query/use-subtrip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

import { SUBTRIP_STATUS_COLORS } from '../../subtrip/constants';

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 90;
const LIST_HEIGHT = ITEM_HEIGHT * 6;

// ----------------------------------------------------------------------

const SubtripItem = ({ subtrip, selectedSubtrip, onSelect }) => {
  const isSelected = selectedSubtrip?._id === subtrip._id;

  return (
    <Box
      component="li"
      sx={{
        gap: 2,
        display: 'flex',
        height: ITEM_HEIGHT,
        alignItems: 'center',
      }}
    >
      <ListItemText
        primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.5 } }}
        secondaryTypographyProps={{ typography: 'caption' }}
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{subtrip.subtripNo}</Typography>
            <Label
              variant="soft"
              color={SUBTRIP_STATUS_COLORS[subtrip.subtripStatus] || 'default'}
              size="small"
            >
              {subtrip.subtripStatus.replace('-', ' ')}
            </Label>

            {!subtrip.isOwn && (
              <Label variant="soft" color="default" size="small">
                Market
              </Label>
            )}
          </Stack>
        }
        secondary={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* <Iconify icon="mdi:map-marker-path" sx={{ color: 'text.secondary' }} /> */}
              <Typography variant="caption">
                {`${subtrip.loadingPoint || 'N/A'} → ${subtrip.unloadingPoint || 'N/A'}`}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption">
                {`${subtrip.vehicleNo || 'N/A'} | ${subtrip.driverName || 'N/A'} | ${subtrip.startDate ? new Date(subtrip.startDate).toLocaleDateString() : 'N/A'}`}
              </Typography>
            </Stack>
          </Stack>
        }
      />

      <Button
        size="small"
        color={isSelected ? 'primary' : 'inherit'}
        onClick={() => onSelect(subtrip)}
        startIcon={
          <Iconify
            width={16}
            icon={isSelected ? 'eva:checkmark-fill' : 'mingcute:add-line'}
            sx={{ mr: -0.5 }}
          />
        }
      >
        {isSelected ? 'Selected' : 'Select'}
      </Button>
    </Box>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ height: LIST_HEIGHT, px: 2.5 }}>
    <Box component="ul">
      {[...Array(6)].map((_, index) => (
        <Box
          component="li"
          key={index}
          sx={{
            gap: 2,
            display: 'flex',
            height: ITEM_HEIGHT,
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  </Box>
);

export function KanbanSubtripDialog({
  statusList = [],
  selectedSubtrip = null,
  open,
  excludeBilled = false,
  excludeIsOwn = false,
  excludeIsMarket = false,
  onClose,
  onSubtripChange,
}) {
  // Check if any filter is active for the header display
  const hasActiveFilters = excludeIsMarket || excludeIsOwn || excludeBilled;
  const scrollRef = useRef(null);
  const [searchSubtrip, setSearchSubtrip] = useState('');
  const debouncedSearch = useDebounce(searchSubtrip);

  const shouldFetch = open && statusList.length > 0;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSubtripsByStatus(
      {
        subtripStatus: statusList,
        rowsPerPage: 50,
        search: debouncedSearch || undefined,
        excludeBilled: excludeBilled || undefined,
        excludeIsOwn: excludeIsOwn || undefined,
        excludeIsMarket: excludeIsMarket || undefined,
      },
      { enabled: shouldFetch }
    );

  const subtrips = useMemo(() => data?.pages.flatMap((p) => p.results) || [], [data]);

  useEffect(() => {
    if (!open) {
      setSearchSubtrip('');
    }
  }, [open]);

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchSubtrips = useCallback((event) => {
    setSearchSubtrip(event.target.value);
  }, []);

  const handleSelectSubtrip = useCallback(
    (subtrip) => {
      onSubtripChange(subtrip);
      onClose();
    },
    [onSubtripChange, onClose]
  );

  const notFound = !subtrips.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle
        sx={{ pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          Jobs{' '}
          <Typography component="span" sx={{ color: 'text.secondary' }}>
            ({data?.pages?.[0]?.total || 0})
          </Typography>
        </Box>

        {hasActiveFilters && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            {excludeIsMarket && (
              <Tooltip title="Showing only own vehicle jobs" arrow>
                <Chip
                  icon={<Iconify icon="mdi:truck-check" width={16} />}
                  label="Own only"
                  size="small"
                  color="info"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}

            {excludeIsOwn && (
              <Tooltip title="Showing only market vehicle jobs" arrow>
                <Chip
                  icon={<Iconify icon="mdi:truck-delivery" width={16} />}
                  label="Market only"
                  size="small"
                  color="warning"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}

            {excludeBilled && (
              <Tooltip title="Showing only unbilled jobs" arrow>
                <Chip
                  icon={<Iconify icon="mdi:receipt-text-remove" width={16} />}
                  label="Unbilled"
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Stack>
        )}
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchSubtrip}
          onChange={handleSearchSubtrips}
          placeholder="Search by LR No, vehicle, or driver..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : notFound ? (
          <SearchNotFound query={debouncedSearch} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar ref={scrollRef} sx={{ height: LIST_HEIGHT, px: 2.5 }}>
            <Box component="ul">
              {subtrips.map((subtrip) => (
                <SubtripItem
                  key={subtrip._id}
                  subtrip={subtrip}
                  selectedSubtrip={selectedSubtrip}
                  onSelect={handleSelectSubtrip}
                />
              ))}
              <Box
                ref={loadMoreRef}
                sx={{
                  height: ITEM_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isFetchingNextPage && <CircularProgress size={24} />}
              </Box>
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
