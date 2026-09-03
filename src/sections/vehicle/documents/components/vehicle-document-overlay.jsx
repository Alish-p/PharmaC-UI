import { useInView } from 'react-intersection-observer';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fDate } from 'src/utils/format-time';

import { useInfiniteDocuments } from 'src/query/use-documents';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { TableNoData } from 'src/components/table/table-no-data';

import { getStatusMeta, getExpiryStatus } from 'src/sections/vehicle/utils/document-utils';

import { openDocumentDownload } from '../utils/download';

const DOCS_PAGE_SIZE = 20;

export function VehicleDocumentOverlay({ open, onClose, vehicle }) {
  const vehicleId = useMemo(() => vehicle?._id, [vehicle]);
  const [includeInactive, setIncludeInactive] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  // Single stream when only active docs
  const singleParams = useMemo(
    () => (vehicleId ? { vehicleId, rowsPerPage: DOCS_PAGE_SIZE, isActive: true } : undefined),
    [vehicleId]
  );
  const {
    data: dataSingle,
    fetchNextPage: fetchNextSingle,
    hasNextPage: hasNextSingle,
    isFetchingNextPage: fetchingNextSingle,
    isLoading: isLoadingSingle,
  } = useInfiniteDocuments(singleParams, { enabled: open && !!vehicleId && !includeInactive });

  // Dual streams when including inactive: active + inactive, merged
  const activeParams = useMemo(
    () => (vehicleId ? { vehicleId, rowsPerPage: DOCS_PAGE_SIZE, isActive: true } : undefined),
    [vehicleId]
  );
  const inactiveParams = useMemo(
    () => (vehicleId ? { vehicleId, rowsPerPage: DOCS_PAGE_SIZE, isActive: false } : undefined),
    [vehicleId]
  );
  const {
    data: dataActive,
    fetchNextPage: fetchNextActive,
    hasNextPage: hasNextActive,
    isFetchingNextPage: fetchingNextActive,
    isLoading: isLoadingActive,
  } = useInfiniteDocuments(activeParams, { enabled: open && !!vehicleId && includeInactive });
  const {
    data: dataInactive,
    fetchNextPage: fetchNextInactive,
    hasNextPage: hasNextInactive,
    isFetchingNextPage: fetchingNextInactive,
    isLoading: isLoadingInactive,
  } = useInfiniteDocuments(inactiveParams, { enabled: open && !!vehicleId && includeInactive });

  useEffect(() => {
    if (!inView) return;
    if (!includeInactive) {
      if (hasNextSingle && !fetchingNextSingle) fetchNextSingle();
      return;
    }
    if (hasNextActive && !fetchingNextActive) fetchNextActive();
    if (hasNextInactive && !fetchingNextInactive) fetchNextInactive();
  }, [
    inView,
    includeInactive,
    hasNextSingle,
    fetchingNextSingle,
    fetchNextSingle,
    hasNextActive,
    fetchingNextActive,
    fetchNextActive,
    hasNextInactive,
    fetchingNextInactive,
    fetchNextInactive,
  ]);

  const docsSingle = dataSingle ? dataSingle.pages.flatMap((p) => p.results || []) : [];
  const docsActive = dataActive ? dataActive.pages.flatMap((p) => p.results || []) : [];
  const docsInactive = dataInactive ? dataInactive.pages.flatMap((p) => p.results || []) : [];
  const docs = includeInactive ? [...docsActive, ...docsInactive] : docsSingle;
  const totalSingle = dataSingle?.pages?.[0]?.total || 0;
  const totalActive = dataActive?.pages?.[0]?.total || 0;
  const totalInactive = dataInactive?.pages?.[0]?.total || 0;
  const total = includeInactive ? totalActive + totalInactive : totalSingle;

  const isLoading = includeInactive ? isLoadingActive || isLoadingInactive : isLoadingSingle;
  const isFetchingNextPage = includeInactive
    ? fetchingNextActive || fetchingNextInactive
    : fetchingNextSingle;

  const handleDownload = useCallback(
    async (doc) => {
      if (!vehicleId || !doc?._id) return;
      await openDocumentDownload({ vehicleId, docId: doc._id, fallbackUrl: doc?.fileUrl });
    },
    [vehicleId]
  );

  const renderStatus = (status) => {
    if (!status) return '-';
    const cfg = getStatusMeta(status);
    if (!cfg) return '-';
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon={cfg.icon} sx={{ color: `${cfg.color}.main` }} />
        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
          {status}
        </Typography>
      </Stack>
    );
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle>
        Documents — {vehicle?.vehicleNo}
        <Typography component="span" sx={{ color: 'text.secondary', ml: 1 }}>
          ({total})
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <FormControlLabel
            sx={{ ml: 'auto' }}
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="Include inactive"
          />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <LoadingSpinner sx={{ height: 320 }} />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Scrollbar fillContent sx={{ height: 1, px: 0.5 }}>
              <Table size="small" sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>Issue</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docs.map((d) => (
                    <TableRow key={d._id} hover>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{d.docType}</TableCell>
                      <TableCell>{d.docNumber || '-'}</TableCell>
                      <TableCell>{d.issueDate ? fDate(d.issueDate) : '-'}</TableCell>
                      <TableCell>{d.expiryDate ? fDate(d.expiryDate) : '-'}</TableCell>
                      <TableCell>{renderStatus(getExpiryStatus(d.expiryDate))}</TableCell>
                      <TableCell>{d.isActive ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          disabled={!d.fileUrl}
                          onClick={() => handleDownload(d)}
                          startIcon={<Iconify icon="eva:download-outline" />}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {docs.length === 0 && <TableNoData notFound />}

                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box
                        ref={loadMoreRef}
                        sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
                      >
                        {isFetchingNextPage && <LoadingSpinner />}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
