import { useInView } from 'react-intersection-observer';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGps } from 'src/query/use-gps';
import { useInfiniteTyres } from 'src/query/use-tyre';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

const ITEM_HEIGHT = 64;

export function KanbanTyreDialog({ open, onClose, onTyreSelect, vehicleNo }) {
  const scrollRef = useRef(null);
  const [searchTyre, setSearchTyre] = useState('');
  const [odometer, setOdometer] = useState('');
  const debouncedSearch = useDebounce(searchTyre);

  const { ref: loadMoreRef, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteTyres(
    {
      serialNumber: debouncedSearch || undefined,
      status: 'In_Stock', // Only fetch tyres in stock/available
      limit: 50,
    },
    { enabled: open }
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const tyres = useMemo(() => (data ? data.pages.flatMap((page) => page.tyres) : []), [data]);
  const total = data?.pages?.[0]?.total ?? 0;

  const { data: gpsData } = useGps(vehicleNo, { enabled: open && !!vehicleNo });

  useEffect(() => {
    if (open && gpsData?.totalOdometer) {
      setOdometer(gpsData.totalOdometer);
    }
  }, [open, gpsData]);

  // Cleanup when closed
  useEffect(() => {
    if (!open) {
      setSearchTyre('');
      setOdometer('');
    }
  }, [open]);

  const handleSearch = useCallback((e) => {
    setSearchTyre(e.target.value);
  }, []);

  const handleSelect = useCallback(
    (tyre) => {
      if (!odometer) return;
      onTyreSelect(tyre, Number(odometer));
      onClose();
    },
    [onTyreSelect, onClose, odometer]
  );

  const notFound = !tyres.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Select Tyre{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({total})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Odometer Reading"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          helperText="Enter current vehicle odometer"
          InputProps={{
            endAdornment: <InputAdornment position="end">km</InputAdornment>,
          }}
        />
        <TextField
          fullWidth
          value={searchTyre}
          onChange={handleSearch}
          placeholder="Search by tyre number..."
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
          <LoadingSpinner sx={{ height: ITEM_HEIGHT * 6 }} />
        ) : notFound ? (
          <SearchNotFound query={debouncedSearch} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar ref={scrollRef} sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {tyres.map((tyre) => (
                <Box
                  component="li"
                  key={tyre._id}
                  sx={{
                    gap: 2,
                    display: 'flex',
                    height: ITEM_HEIGHT,
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
                    secondaryTypographyProps={{ typography: 'caption' }}
                    primary={tyre.serialNumber}
                    secondary={`${tyre.brand} ${tyre.model} - ${tyre.size}`}
                  />
                  <Button
                    size="small"
                    color="inherit"
                    disabled={!odometer}
                    onClick={() => handleSelect(tyre)}
                    startIcon={<Iconify width={16} icon="mingcute:add-line" sx={{ mr: -0.5 }} />}
                  >
                    Select
                  </Button>
                </Box>
              ))}
              <Box
                ref={loadMoreRef}
                sx={{
                  py: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: isFetchingNextPage || hasNextPage ? 'visible' : 'hidden',
                }}
              >
                {(isFetchingNextPage || hasNextPage) && <LoadingSpinner />}
              </Box>
              {tyres.length === 0 && !debouncedSearch && (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  No available tyres found.
                </Box>
              )}
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
