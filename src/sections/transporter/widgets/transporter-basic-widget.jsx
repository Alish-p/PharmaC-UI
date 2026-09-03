import { useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { copyToClipboard } from 'src/utils/copy-to-clipboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { InfoItem } from './info-item';

export function TransporterBasicWidget({ transporter }) {
  const { _id, transportName, ownerName, transportType, address, state, pinNo, cellNo, emailId } =
    transporter || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify(
      {
        transportName,
        ownerName,
        transportType,
        address,
        state,
        pinNo,
        cellNo,
        emailId,
      },
      null,
      2
    );
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [address, cellNo, emailId, ownerName, pinNo, state, transportName, transportType]);

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
        <InfoItem label="Transport Name" value={transportName} />
        <InfoItem label="Owner Name" value={ownerName} />
        <InfoItem label="Transport Type" value={transportType} />
        <InfoItem label="Address" value={address} />
        <InfoItem label="State" value={state} />
        <InfoItem label="Pin Code" value={pinNo} />
        <InfoItem
          label="Mobile"
          value={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{cellNo}</Typography>
              <IconButton
                color="success"
                onClick={() => window.open(`https://wa.me/${cellNo}`, '_blank')}
              >
                <Iconify icon="prime:whatsapp" />
              </IconButton>
            </Stack>
          }
        />
        <InfoItem label="Email" value={emailId} />
      </Stack>
    </Card>
  );
}

export default TransporterBasicWidget;
