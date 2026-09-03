import { useInView } from 'react-intersection-observer';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useDebounce } from 'src/hooks/use-debounce';

import { useInfiniteTransporters } from 'src/query/use-transporter';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

// ----------------------------------------------------------------------

export function KanbanTransporterDialog({
  selectedTransporter = null,
  open,
  onClose,
  onTransporterChange,
}) {
  const scrollRef = useRef(null);
  const [searchTransporter, setSearchTransporter] = useState('');
  const debouncedSearch = useDebounce(searchTransporter, 300);

  // Reset search every time the dialog opens
  useEffect(() => {
    if (open) {
      setSearchTransporter('');
    }
  }, [open]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } =
    useInfiniteTransporters(
      {
        search: debouncedSearch || undefined,
        rowsPerPage: 50,
        status: 'all',
        includeLastSubtrip: false,
      },
      {
        enabled: open,
        keepPreviousData: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
      }
    );

  const transporters = data ? data.pages.flatMap((p) => p.transporters) : [];

  const handleSearchTransporters = useCallback((event) => {
    setSearchTransporter(event.target.value);
  }, []);

  const handleSelectTransporter = useCallback(
    (transporter) => {
      onTransporterChange(transporter);
      onClose();
    },
    [onTransporterChange, onClose]
  );

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notFound = !transporters.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Transporters{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({data?.pages?.[0]?.total || 0})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchTransporter}
          onChange={handleSearchTransporters}
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
          <LoadingSpinner sx={{ height: ITEM_HEIGHT * 6 }} />
        ) : notFound ? (
          <SearchNotFound query={searchTransporter} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar ref={scrollRef} sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {transporters.map((transporter) => {
                const isSelected = selectedTransporter?._id === transporter._id;

                return (
                  <Box
                    component="li"
                    key={transporter._id}
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
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2">{transporter.transportName}</Typography>
                          <Label
                            variant="soft"
                            color={transporter.isActive ? 'success' : 'error'}
                            size="small"
                          >
                            {transporter.isActive ? 'Active' : 'Inactive'}
                          </Label>
                        </Stack>
                      }
                      secondary={
                        <>
                          {transporter.place} • {transporter.cellNo}
                        </>
                      }
                    />

                    <Button
                      size="small"
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleSelectTransporter(transporter)}
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
              })}
              <Box
                ref={loadMoreRef}
                sx={{
                  height: ITEM_HEIGHT,
                }}
              >
                {isFetching && <LoadingSpinner />}
              </Box>
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
