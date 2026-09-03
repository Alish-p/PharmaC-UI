import { useInView } from 'react-intersection-observer';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useDebounce } from 'src/hooks/use-debounce';

import { fDate } from 'src/utils/format-time';

import { useInfiniteTripsPreview } from 'src/query/use-trip';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

const ITEM_HEIGHT = 64;

function TripItem({ trip, selectedTrip, onSelect }) {
  const isSelected = selectedTrip?._id === trip._id;

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: ITEM_HEIGHT,
        gap: 2,
      }}
    >
      <ListItemText
        primaryTypographyProps={{
          typography: 'subtitle2',
          sx: { mb: 0.25 },
        }}
        secondaryTypographyProps={{
          typography: 'caption',
        }}
        primary={`Trip ${trip.tripNo}`}
        secondary={
          <>
            {trip.vehicleId?.vehicleNo || '—'} |{' '}
            {(() => {
              const drivers = new Set();
              if (trip.subtrips && trip.subtrips.length > 0) {
                trip.subtrips.forEach((st) => {
                  if (st.driverId?.driverName) drivers.add(st.driverId.driverName);
                });
              }
              return drivers.size > 0 ? Array.from(drivers).join(', ') : '—';
            })()}{' '}
            | {fDate(trip.fromDate)}
          </>
        }
      />

      <Button
        size="small"
        color={isSelected ? 'primary' : 'inherit'}
        onClick={() => onSelect(trip)}
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
}

function LoadingSkeleton() {
  return (
    <Box sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
      <Box component="ul">
        {[...Array(6)].map((_, index) => (
          <Box
            component="li"
            key={index}
            sx={{ display: 'flex', alignItems: 'center', height: ITEM_HEIGHT, gap: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={100} height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function KanbanTripDialog({
  selectedTrip = null,
  open,
  onClose,
  onTripChange,
  status = [],
}) {
  const scrollRef = useRef(null);
  const [searchTrip, setSearchTrip] = useState('');
  const debouncedSearch = useDebounce(searchTrip);

  const shouldFetch = open && status.length > 0;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteTripsPreview(
      { search: debouncedSearch || undefined, status, rowsPerPage: 50 },
      { enabled: shouldFetch }
    );

  const trips = useMemo(() => data?.pages.flatMap((p) => p.trips) || [], [data]);

  useEffect(() => {
    if (!open) {
      setSearchTrip('');
    }
  }, [open]);

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchTrips = useCallback((event) => {
    setSearchTrip(event.target.value);
  }, []);

  const handleSelectTrip = useCallback(
    (trip) => {
      onTripChange(trip);
      onClose();
    },
    [onTripChange, onClose]
  );

  const notFound = !trips.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Trips{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({data?.pages?.[0]?.total || 0})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchTrip}
          onChange={handleSearchTrips}
          placeholder="Search..."
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
          <Scrollbar ref={scrollRef} sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {trips.map((trip) => (
                <TripItem
                  key={trip._id}
                  trip={trip}
                  selectedTrip={selectedTrip}
                  onSelect={handleSelectTrip}
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
                {isFetchingNextPage && <LoadingSpinner />}
              </Box>
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
