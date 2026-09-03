import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Stack,
  Table,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  CardHeader,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axios from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';

import { useTenant } from 'src/query/use-tenant';
import {
  usePaginatedDocuments,
  useSyncVehicleDocuments,
  useDeleteVehicleDocument,
} from 'src/query/use-documents';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TableSkeleton } from 'src/components/table';

import { getStatusMeta, getExpiryStatus } from 'src/sections/vehicle/utils/document-utils';

import { REQUIRED_DOC_TYPES } from '../documents/vehicle-document-config';

export function VehicleDocumentsWidget({ vehicleId, vehicleNo }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('current');
  const { data: tenant } = useTenant();
  const integrationEnabled = !!tenant?.integrations?.vehicleApi?.enabled;

  // Fetch active and inactive documents separately so history includes isActive=false
  const { data: activeResp, isLoading: isLoadingActive } = usePaginatedDocuments({
    page: 1,
    rowsPerPage: 1000,
    vehicleId,
    isActive: true,
  });
  const { data: historyResp, isLoading: isLoadingHistory } = usePaginatedDocuments({
    page: 1,
    rowsPerPage: 1000,
    vehicleId,
    isActive: false,
  });

  const activeDocs = activeResp?.results || [];
  const historyDocs = historyResp?.results || [];

  const loading = isLoadingActive || isLoadingHistory;

  const activeCount = activeResp?.total ?? activeResp?.docsTotal ?? activeDocs.length;
  const historyCount = historyResp?.total ?? historyResp?.docsTotal ?? historyDocs.length;

  // Required vs present summary (simple chips)
  const requiredTypes = REQUIRED_DOC_TYPES;

  const getDocByType = (type) =>
    (activeDocs || []).find((d) => String(d.docType).toLowerCase() === String(type).toLowerCase());

  const { syncDocuments, isSyncing } = useSyncVehicleDocuments();

  const handleSync = async () => {
    if (!vehicleNo) {
      toast.error('Vehicle number not available to sync');
      return;
    }
    try {
      await syncDocuments({ vehicleNo, vehicleId });
    } catch (e) {
      // toast handled in hook
    }
  };

  const handleUpload = () => {
    navigate(`${paths.dashboard.vehicle.newDocument}?vehicleId=${vehicleId}`);
  };

  return (
    <Card>
      <CardHeader
        title="Documents"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {integrationEnabled && (
              <Tooltip title="Fetch latest documents from Govt portal">
                <span>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={
                      <Iconify
                        icon={isSyncing ? 'line-md:loading-twotone-loop' : 'mdi:cloud-sync-outline'}
                      />
                    }
                    onClick={handleSync}
                    disabled={!vehicleNo || isSyncing}
                    size="small"
                  >
                    {isSyncing ? 'Syncing…' : 'Sync Govt Portal'}
                  </Button>
                </span>
              </Tooltip>
            )}

            <Button
              variant="contained"
              startIcon={<Iconify icon="bytesize:upload" />}
              onClick={handleUpload}
              size="small"
            >
              Upload
            </Button>
          </Stack>
        }
      />

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        sx={{ px: 3, mt: 1 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab
          value="current"
          label={`Current (${activeCount || 0})`}
          icon={<Iconify icon="mdi:file-check-outline" sx={{ color: 'success.main' }} />}
          iconPosition="start"
        />
        <Tab
          value="history"
          label={`History (${historyCount || 0})`}
          icon={<Iconify icon="mdi:archive-clock-outline" sx={{ color: 'text.secondary' }} />}
          iconPosition="start"
        />
      </Tabs>

      {/* Required documents quick status */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {loading && (
            <Typography variant="caption" color="text.secondary">
              Checking…
            </Typography>
          )}
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {requiredTypes.map((t) => {
            const doc = getDocByType(t);
            const status = doc ? getExpiryStatus(doc.expiryDate) || 'Valid' : 'Missing';
            const meta = getStatusMeta(status);

            // Tooltip message
            let tip = 'Required document';
            if (!doc) {
              tip = `Missing — add ${t}`;
            } else if (!doc.expiryDate) {
              tip = 'Present — no expiry date';
            } else {
              const now = new Date();
              const exp = new Date(doc.expiryDate);
              const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays < 0) tip = `Expired ${Math.abs(diffDays)} days ago on ${fDate(exp)}`;
              else if (diffDays <= 15) tip = `Expiring in ${diffDays} days on ${fDate(exp)}`;
              else tip = `Valid — expires in ${diffDays} days on ${fDate(exp)}`;
            }

            return (
              <Tooltip key={t} title={tip} arrow placement="top">
                <span>
                  <Label
                    color={meta?.color || 'default'}
                    variant="soft"
                    startIcon={<Iconify icon={meta?.icon || 'mdi:minus-circle-outline'} />}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {t}
                  </Label>
                </span>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      {tab === 'current' && (
        <Box sx={{ p: 3, pt: 2, overflowX: { xs: 'auto', md: 'visible' } }}>
          {loading ? (
            <TableSkeleton sx={{ minWidth: 720 }} rowCount={3} headCount={6} />
          ) : (
            <DocumentsTable
              rows={activeDocs || []}
              vehicleId={vehicleId}
              emptyLabel="No active documents"
            />
          )}
        </Box>
      )}

      {tab === 'history' && (
        <Box sx={{ p: 3, pt: 2, overflowX: { xs: 'auto', md: 'visible' } }}>
          {loading ? (
            <TableSkeleton sx={{ minWidth: 720 }} rowCount={3} headCount={7} />
          ) : (
            <DocumentsTable
              rows={historyDocs || []}
              vehicleId={vehicleId}
              showActive
              emptyLabel="No history"
            />
          )}
        </Box>
      )}
    </Card>
  );
}

function DocumentsTable({ rows, vehicleId, showActive = false, emptyLabel = 'No data' }) {
  const hasRows = Array.isArray(rows) && rows.length > 0;
  const confirmDelete = useBoolean();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const onDelete = (row) => {
    setSelectedDoc(row);
    confirmDelete.onTrue();
  };
  const handleDownload = async (row) => {
    try {
      const { data } = await axios.get(`/api/documents/${vehicleId}/${row._id}/download`);
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('No download URL received');
      }
    } catch (e) {
      const msg = e?.message || 'Failed to get download link';
      toast.error(msg);
    }
  };
  const renderStatus = (status) => {
    if (!status) return '-';
    const cfg = getStatusMeta(status);
    if (!cfg) return '-';
    return (
      <Label color={cfg.color} startIcon={<Iconify icon={cfg.icon} />}>
        {status}
      </Label>
    );
  };

  return (
    <>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
            {showActive && <TableCell>Active</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {!hasRows && <TableNoData notFound title={emptyLabel} />}
          {rows?.map((d) => (
            <TableRow key={d._id} hover>
              <TableCell sx={{ textTransform: 'capitalize' }}>{d.docType}</TableCell>
              <TableCell>{d.docNumber || '-'}</TableCell>
              <TableCell>{d.issueDate ? fDate(d.issueDate) : '-'}</TableCell>
              <TableCell>{d.expiryDate ? fDate(d.expiryDate) : '-'}</TableCell>
              <TableCell>{renderStatus(getExpiryStatus(d.expiryDate))}</TableCell>
              <TableCell align="center">
                {d.fileUrl && (
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => handleDownload(d)}>
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="View">
                  <IconButton
                    size="small"
                    component={RouterLink}
                    to={paths.dashboard.vehicle.documentDetails(d._id)}
                  >
                    <Iconify icon="solar:eye-bold" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    component={RouterLink}
                    to={paths.dashboard.vehicle.editDocument(d._id)}
                  >
                    <Iconify icon="eva:edit-2-outline" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDelete(d)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              {showActive && (
                <TableCell>
                  <Label
                    color={d.isActive ? 'success' : 'error'}
                    variant="soft"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {d.isActive ? 'Yes' : 'No'}
                  </Label>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDeleteDocument
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        vehicleId={vehicleId}
        doc={selectedDoc}
      />
    </>
  );
}

function ConfirmDeleteDocument({ open, onClose, vehicleId, doc }) {
  const del = useDeleteVehicleDocument();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await del({ vehicleId, docId: doc?._id });
      onClose();
    } catch (e) {
      // handled by hook toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete document?"
      content={`This will remove ${doc?.docType || 'document'} record. File on storage is not deleted.`}
      action={
        <Button color="error" variant="contained" onClick={handleDelete} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : 'Delete'}
        </Button>
      }
    />
  );
}
