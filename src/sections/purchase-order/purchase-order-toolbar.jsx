/* eslint-disable react/prop-types */
import { useCallback } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import PurchaseOrderPdf from 'src/pdfs/purchase-order-pdf';

import { Iconify } from 'src/components/iconify';

import { useTenantContext } from 'src/auth/tenant';

export function PurchaseOrderToolbar({ purchaseOrder, actions = [] }) {
  const router = useRouter();
  const view = useBoolean();
  const tenant = useTenantContext();
  const fileName = purchaseOrder?.purchaseOrderNo || purchaseOrder?._id || 'purchase-order';

  const handleEdit = useCallback(() => {
    if (!purchaseOrder?._id) return;
    router.push(paths.dashboard.purchaseOrder.edit(purchaseOrder._id));
  }, [purchaseOrder?._id, router]);

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          {purchaseOrder?.status === 'pending-approval' && (
            <Tooltip title="Edit">
              <IconButton onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="View">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <PDFDownloadLink
            document={<PurchaseOrderPdf purchaseOrder={purchaseOrder} tenant={tenant} />}
            fileName={fileName}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Tooltip title="Download">
                <IconButton>
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Iconify icon="eva:cloud-download-fill" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </PDFDownloadLink>

          <Box sx={{ flexGrow: 1 }} />

          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outlined"
              size="small"
              startIcon={action.icon ? <Iconify icon={action.icon} /> : null}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              p: 1.5,
            }}
          >
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <PurchaseOrderPdf purchaseOrder={purchaseOrder} tenant={tenant} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
