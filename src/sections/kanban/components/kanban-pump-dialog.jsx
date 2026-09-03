import { useInView } from 'react-intersection-observer';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useInfinitePumps } from 'src/query/use-pump';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

// ----------------------------------------------------------------------

export function KanbanPumpDialog({ selectedPump = null, open, onClose, onPumpChange }) {
  const scrollRef = useRef(null);
  const [searchPump, setSearchPump] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } =
    useInfinitePumps({ search: searchPump || undefined, rowsPerPage: 50 }, { enabled: open });

  const pumps = data ? data.pages.flatMap((p) => p.pumps) : [];

  const handleSearchPumps = useCallback((event) => {
    setSearchPump(event.target.value);
  }, []);

  const handleSelectPump = useCallback(
    (pump) => {
      onPumpChange(pump);
      onClose();
    },
    [onPumpChange, onClose]
  );

  const { ref: loadMoreRef, inView } = useInView({ root: scrollRef.current });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notFound = !pumps.length && !!searchPump && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Pumps{' '}
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          ({data?.pages?.[0]?.total || 0})
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchPump}
          onChange={handleSearchPumps}
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
          <SearchNotFound query={searchPump} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar ref={scrollRef} sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {pumps.map((pump) => {
                const isSelected = selectedPump?._id === pump._id;

                return (
                  <Box
                    component="li"
                    key={pump._id}
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
                      primary={pump.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption">
                            {pump.phone} • {pump.address}
                          </Typography>
                        </Box>
                      }
                    />

                    <Button
                      size="small"
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleSelectPump(pump)}
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
