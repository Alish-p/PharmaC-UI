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

import { useInfiniteVendors } from 'src/query/use-vendor';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

const ITEM_HEIGHT = 64;

export function KanbanVendorDialog({ selectedVendor = null, open, onClose, onVendorChange }) {
  const scrollRef = useRef(null);
  const [searchVendor, setSearchVendor] = useState('');
  const debouncedSearch = useDebounce(searchVendor);

  const [blockedPrefixes, setBlockedPrefixes] = useState([]);

  const shouldFetch =
    open &&
    (debouncedSearch === '' ||
      !blockedPrefixes.some((prefix) => debouncedSearch.startsWith(prefix)));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteVendors(
    { name: debouncedSearch || undefined, rowsPerPage: 50 },
    { enabled: shouldFetch }
  );

  const vendors = useMemo(() => data?.pages.flatMap((p) => p.vendors) || [], [data]);

  useEffect(() => {
    if (
      !isLoading &&
      debouncedSearch &&
      vendors.length === 0 &&
      !blockedPrefixes.includes(debouncedSearch)
    ) {
      setBlockedPrefixes((prev) => [...prev, debouncedSearch]);
    }
  }, [debouncedSearch, vendors, isLoading, blockedPrefixes]);

  useEffect(() => {
    if (!open) {
      setSearchVendor('');
      setBlockedPrefixes([]);
    }
  }, [open]);

  const handleSearchVendors = useCallback((e) => {
    setSearchVendor(e.target.value);
  }, []);

  const handleSelectVendor = useCallback(
    (vendor) => {
      onVendorChange(vendor);
      onClose();
    },
    [onVendorChange, onClose]
  );

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notFound = !vendors.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Vendors{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({data?.pages?.[0]?.total || 0})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchVendor}
          onChange={handleSearchVendors}
          placeholder="Search by vendor name..."
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
              {vendors.map((vendor) => {
                const isSelected = selectedVendor?._id === vendor._id;
                return (
                  <Box
                    component="li"
                    key={vendor._id}
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
                      primary={vendor.name}
                      secondary={`${vendor.phone} • ${vendor.address}`}
                    />
                    <Button
                      size="small"
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleSelectVendor(vendor)}
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
