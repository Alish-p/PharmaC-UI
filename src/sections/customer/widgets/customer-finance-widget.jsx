import { useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { copyToClipboard } from 'src/utils/copy-to-clipboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { InfoItem } from './info-item';

export function CustomerFinanceWidget({ customer }) {
  const { _id, bankDetails, gstEnabled, GSTNo, PANNo } = customer || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify({ bankDetails, gstEnabled, GSTNo, PANNo }, null, 2);
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [GSTNo, PANNo, bankDetails, gstEnabled]);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Finance Details"
        avatar={<Iconify icon="solar:wallet-bold" color="primary.main" width={24} />}
        action={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Copy">
              <IconButton onClick={handleCopy}>
                <Iconify icon="solar:copy-bold" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton component={RouterLink} href={paths.dashboard.customer.edit(_id)}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{
          '& .MuiCardHeader-avatar': { mr: 1 },
          '& .MuiCardHeader-title': { fontWeight: 'fontWeightBold' },
        }}
      />
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <InfoItem label="Bank Name" value={bankDetails?.name} />
        <InfoItem label="Branch" value={bankDetails?.branch} />
        <InfoItem label="IFSC" value={bankDetails?.ifsc} />
        <InfoItem label="Place" value={bankDetails?.place} />
        <InfoItem label="Account No" value={bankDetails?.accNo} />
        <InfoItem
          label="GST Enabled"
          value={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon={gstEnabled ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                color={gstEnabled ? 'success.main' : 'error.main'}
                width={20}
              />
              {gstEnabled ? 'Yes' : 'No'}
            </Stack>
          }
        />
        <InfoItem label="GST No" value={GSTNo} />
        <InfoItem label="PAN No" value={PANNo} />
      </Stack>
    </Card>
  );
}

export default CustomerFinanceWidget;
