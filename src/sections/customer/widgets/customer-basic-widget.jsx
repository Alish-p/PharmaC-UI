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

export function CustomerBasicWidget({ customer }) {
  const { _id, customerName, address, state, pinCode, cellNo } = customer || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify({ customerName, address, state, pinCode, cellNo }, null, 2);
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [address, cellNo, customerName, pinCode, state]);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Basic Details"
        avatar={<Iconify icon="solar:user-bold" color="primary.main" width={24} />}
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
        <InfoItem label="Customer Name" value={customerName} />
        <InfoItem label="Address" value={address} />
        <InfoItem label="State" value={state} />
        <InfoItem label="Pin Code" value={pinCode} />
        <InfoItem label="Mobile" value={cellNo} />
      </Stack>
    </Card>
  );
}

export default CustomerBasicWidget;
