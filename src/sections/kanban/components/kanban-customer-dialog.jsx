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

import { useInfiniteCustomers } from 'src/query/use-customer';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

const ITEM_HEIGHT = 64;

export function KanbanCustomerDialog({ selectedCustomer = null, open, onClose, onCustomerChange }) {
  const scrollRef = useRef(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const debouncedSearch = useDebounce(searchCustomer);

  // track any prefix that returned zero results
  const [blockedPrefixes, setBlockedPrefixes] = useState([]);

  // decide whether to fire the query
  const shouldFetch =
    open &&
    (debouncedSearch === '' ||
      !blockedPrefixes.some((prefix) => debouncedSearch.startsWith(prefix)));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteCustomers(
    { customerName: debouncedSearch || undefined, rowsPerPage: 50 },
    { enabled: shouldFetch }
  );

  const customers = useMemo(() => data?.pages.flatMap((p) => p.customers) || [], [data]);

  // if a debounced term returned no results, block it
  useEffect(() => {
    if (
      !isLoading &&
      debouncedSearch &&
      customers.length === 0 &&
      !blockedPrefixes.includes(debouncedSearch)
    ) {
      setBlockedPrefixes((prev) => [...prev, debouncedSearch]);
    }
  }, [debouncedSearch, customers, isLoading, blockedPrefixes]);

  // reset when closed
  useEffect(() => {
    if (!open) {
      setSearchCustomer('');
      setBlockedPrefixes([]);
    }
  }, [open]);

  const handleSearchCustomers = useCallback((e) => {
    setSearchCustomer(e.target.value);
  }, []);

  const handleSelectCustomer = useCallback(
    (customer) => {
      onCustomerChange(customer);
      onClose();
    },
    [onCustomerChange, onClose]
  );

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notFound = !customers.length && !!debouncedSearch && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Customers{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({data?.pages?.[0]?.total || 0})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchCustomer}
          onChange={handleSearchCustomers}
          placeholder="Search by customer name..."
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
              {customers.map((customer) => {
                const isSelected = selectedCustomer?._id === customer._id;
                return (
                  <Box
                    component="li"
                    key={customer._id}
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
                      primary={customer.customerName}
                      secondary={`${customer.state} • ${customer.cellNo}`}
                    />
                    <Button
                      size="small"
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleSelectCustomer(customer)}
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
