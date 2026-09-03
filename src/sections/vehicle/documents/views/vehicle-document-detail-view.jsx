import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import axios from 'src/utils/axios';
import { fDate, fDateTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  usePaginatedDocuments,
  useSyncVehicleDocuments,
  useDeleteVehicleDocument,
} from 'src/query/use-documents';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { HeroHeader } from 'src/components/hero-header-card';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { getStatusMeta, getExpiryStatus } from '../../utils/document-utils';

export function VehicleDocumentDetailView({ doc }) {
  const navigate = useNavigate();
  const confirmDelete = useBoolean();
  const [deleting, setDeleting] = useState(false);
  const del = useDeleteVehicleDocument();
  const { syncDocuments, isSyncing } = useSyncVehicleDocuments();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const vehicleId = useMemo(() => {
    const raw = doc?.vehicleId || doc?.vehicle?._id || doc?.vehicle?.id || doc?.vehicle;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    return raw?._id || raw?.id || null;
  }, [doc]);

  useEffect(() => {
    let active = true;
    const loadUrl = async () => {
      if (!doc?._id || !vehicleId) {
        setPreviewUrl(doc?.fileUrl || null);
        return;
      }
      try {
        setLoadingUrl(true);
        const { data } = await axios.get(`/api/documents/${vehicleId}/${doc._id}/download`);
        if (!active) return;
        setPreviewUrl(data?.url || doc?.fileUrl || null);
      } catch (e) {
        if (!active) return;
        setPreviewUrl(doc?.fileUrl || null);
      } finally {
        if (active) setLoadingUrl(false);
      }
    };
    loadUrl();
    return () => {
      active = false;
    };
  }, [doc?._id, doc?.fileUrl, vehicleId]);

  const status = getExpiryStatus(doc?.expiryDate);
  const statusMeta = status ? getStatusMeta(status) : null;

  // History (inactive documents of same type for this vehicle)
  const [histPage, setHistPage] = useState(1);
  const rowsPerPage = 10;

  const {
    data: historyResp,
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = usePaginatedDocuments(
    vehicleId && doc?.docType
      ? {
          vehicleId,
          docType: doc?.docType,
          page: histPage,
          rowsPerPage,
          isActive: false, // fetch inactive only
        }
      : undefined,
    {
      enabled: !!vehicleId && !!doc?.docType,
      keepPreviousData: true,
    }
  );

  const historyList = historyResp?.results || [];
  const historyTotal = historyResp?.total || 0;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await del({ vehicleId, docId: doc?._id });
      confirmDelete.onFalse();
      navigate(paths.dashboard.vehicle.documents);
    } catch (e) {
      // handled by hook toast
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleDownloadHistory = async (historyDoc) => {
    try {
      const { data } = await axios.get(`/api/documents/${vehicleId}/${historyDoc._id}/download`);
      if (data?.url) {
        window.open(data.url, '_blank');
      } else if (historyDoc?.fileUrl) {
        window.open(historyDoc.fileUrl, '_blank');
      } else {
        toast.error('No download URL available');
      }
    } catch (e) {
      if (historyDoc?.fileUrl) {
        window.open(historyDoc.fileUrl, '_blank');
      } else {
        toast.error('Failed to get download URL');
      }
    }
  };

  const isExpiringOrExpired = status === 'Expired' || status === 'Expiring';

  const handleSync = async () => {
    const vehicleNo = doc?.vehicle?.vehicleNo || doc?.vehicleNo;
    if (vehicleNo && doc?.docType) {
      await syncDocuments({ vehicleNo, docType: doc.docType });
    } else {
      toast.error('Vehicle number or document type missing');
    }
  };

  const headerMeta = [
    {
      label: `Vehicle: ${doc?.vehicle?.vehicleNo || doc?.vehicleNo || '-'}`,
      icon: 'solar:garage-bold',
    },
    {
      label: `Number: ${doc?.docNumber || '-'}`,
      icon: 'solar:tag-bold',
    },
  ];

  const headerAction = (
    <Stack direction="row" spacing={1.5}>
      {isExpiringOrExpired && (
        <LoadingButton
          variant="contained"
          startIcon={<Iconify icon="solar:import-bold" />}
          onClick={handleSync}
          loading={isSyncing}
          sx={{
            bgcolor: 'info.lighter',
            color: 'info.main',
            '&:hover': { bgcolor: 'info.light', color: 'info.contrastText' },
          }}
        >
          Fetch from Portal
        </LoadingButton>
      )}
      <Button
        variant="contained"
        startIcon={<Iconify icon="solar:pen-bold" />}
        onClick={() => navigate(paths.dashboard.vehicle.editDocument(doc._id))}
        sx={{
          bgcolor: 'common.white',
          color: 'primary.main',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={confirmDelete.onTrue}
        disabled={deleting}
        sx={{
          bgcolor: 'error.lighter',
          color: 'error.main',
          '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
        }}
      >
        Delete
      </Button>
    </Stack>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vehicle Document Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Documents List', href: paths.dashboard.vehicle.documents },
          { name: doc?.docType || 'Document Details' },
        ]}
        sx={{ mb: { xs: 2, md: 3 } }}
      />

      <HeroHeader
        icon="solar:document-bold"
        title={doc?.docType || 'Document'}
        status={status}
        meta={headerMeta}
        action={headerAction}
        gradient="135deg, #3a9ad9, #83c6f2"
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {/* Left Column: Preview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:document-attachment-bold" />
                  <Typography variant="h6">Attachment Preview</Typography>
                </Stack>
              }
              sx={{ px: 0, pt: 0, mb: 3 }}
            />
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: 'background.neutral',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loadingUrl ? (
                <CircularProgress />
              ) : previewUrl ? (
                <FileThumbnail
                  imageView
                  tooltip
                  onDownload={handleDownload}
                  file={previewUrl}
                  sx={{
                    width: 1,
                    height: 1,
                    minHeight: 320,
                    borderRadius: 'inherit',
                  }}
                  slotProps={{
                    img: {
                      width: 1,
                      height: 1,
                      objectFit: 'contain',
                    },
                    icon: { width: 96, height: 96 },
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachment file uploaded for this document
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Properties */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:info-circle-bold" />
                  <Typography variant="h6">Properties</Typography>
                </Stack>
              }
              sx={{ px: 0, pt: 0, mb: 3 }}
            />
            <Stack spacing={1}>
              <PropRow label="Vehicle Number" value={doc?.vehicle?.vehicleNo || doc?.vehicleNo || '-'} />
              <Divider />
              <PropRow label="Document Type" value={doc?.docType || '-'} />
              <Divider />
              <PropRow label="Document Number" value={doc?.docNumber || '-'} />
              <Divider />
              <PropRow label="Issuer" value={doc?.issuer || '-'} />
              <Divider />
              <PropRow label="Issue Date" value={doc?.issueDate ? fDateTime(doc.issueDate) : '-'} />
              <Divider />
              <PropRow label="Expiry Date" value={doc?.expiryDate ? fDateTime(doc.expiryDate) : '-'} />
              <Divider />
              <PropRow
                label="Status"
                value={
                  statusMeta ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon={statusMeta.icon} sx={{ color: `${statusMeta.color}.main`, width: 18, height: 18 }} />
                      <Typography variant="body2" sx={{ color: `${statusMeta.color}.main`, fontWeight: 'fontWeightSemiBold' }}>
                        {status}
                      </Typography>
                    </Stack>
                  ) : (
                    '-'
                  )
                }
              />
              <Divider />
              <PropRow
                label="Created By"
                value={doc?.createdBy?.name || doc?.createdByName || '-'}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Bottom Section: History */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:history-bold" />
                  <Typography variant="h6">Document Version History</Typography>
                </Stack>
              }
              sx={{ px: 0, pt: 0, mb: 3 }}
            />

            {historyLoading && (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress size={24} />
              </Stack>
            )}

            {!historyLoading && historyList.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No version history available for this document.
              </Typography>
            )}

            {!historyLoading && historyList.length > 0 && (
              <Box>
                <TableContainer component={Box} sx={{ borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: 'background.neutral' }}>
                      <TableRow>
                        <TableCell><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Uploaded</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Doc Number</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Issuer</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Validity</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Uploaded By</Typography></TableCell>
                        <TableCell align="center"><Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Action</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyList.map((h) => {
                        // Validity custom logic
                        const renderValidity = (expiryDate) => {
                          if (!expiryDate) {
                            return {
                              primary: <Typography variant="body2">-</Typography>,
                              secondary: null,
                            };
                          }
                          const now = new Date();
                          const exp = new Date(expiryDate);
                          const diffMs = exp.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                          const absDays = Math.abs(diffDays);
                          const isExpired = diffDays < 0;

                          let primary;
                          let secondaryText;

                          if (isExpired) {
                            primary = (
                              <Label color="error" variant="soft">
                                Expired
                              </Label>
                            );
                            secondaryText = `Expired ${absDays} day${absDays > 1 ? 's' : ''} ago`;
                          } else {
                            primary = (
                              <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
                                Expires on {fDate(expiryDate)}
                              </Typography>
                            );
                            secondaryText = `Expiring in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
                          }

                          return {
                            primary,
                            secondary: (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                {secondaryText}
                              </Typography>
                            ),
                          };
                        };

                        const { primary, secondary } = renderValidity(h.expiryDate);

                        return (
                          <TableRow key={h._id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {h.createdAt ? fDateTime(h.createdAt) : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{h.docNumber || '-'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{h.issuer || '-'}</Typography>
                            </TableCell>
                            <TableCell>
                              {primary}
                              {secondary}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {h.createdBy?.name || 'System'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {h.fileUrl ? (
                                <IconButton color="primary" onClick={() => handleDownloadHistory(h)}>
                                  <Iconify icon="solar:download-bold" />
                                </IconButton>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {historyTotal > rowsPerPage && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 3 }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={histPage <= 1 || historyFetching}
                      onClick={() => setHistPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Page {histPage} of {Math.max(1, Math.ceil(historyTotal / rowsPerPage))}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        histPage >= Math.ceil(historyTotal / rowsPerPage) || historyFetching
                      }
                      onClick={() => setHistPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete document?"
        content={`This will remove ${doc?.docType || 'document'} record. File on storage is not deleted.`}
        action={
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        }
      />
    </DashboardContent>
  );
}

function PropRow({ label, value }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ typography: 'body2', py: 1.25 }}>
      <Box component="span" sx={{ width: 160, color: 'text.secondary', fontWeight: 'fontWeightMedium', flexShrink: 0 }}>
        {label}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{value}</Typography>
        ) : (
          value
        )}
      </Box>
    </Stack>
  );
}
