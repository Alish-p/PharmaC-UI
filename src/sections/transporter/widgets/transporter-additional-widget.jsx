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

export function TransporterAdditionalWidget({ transporter }) {
  const { _id, gstEnabled, gstNo, panNo, agreementNo, podCharges } = transporter || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify({ gstEnabled, gstNo, panNo, agreementNo, podCharges }, null, 2);
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [agreementNo, gstEnabled, gstNo, panNo, podCharges]);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Additional Details"
        avatar={<Iconify icon="solar:settings-bold" color="primary.main" width={24} />}
        action={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Copy">
              <IconButton onClick={handleCopy}>
                <Iconify icon="solar:copy-bold" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton component={RouterLink} href={paths.dashboard.transporter.edit(_id)}>
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
        <InfoItem label="GST No" value={gstNo} />
        <InfoItem label="PAN No" value={panNo} />
        <InfoItem label="Agreement No" value={agreementNo} />
        <InfoItem label="POD Charges" value={podCharges} />
      </Stack>
    </Card>
  );
}

export default TransporterAdditionalWidget;
