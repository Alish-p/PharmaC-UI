import { useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { copyToClipboard } from 'src/utils/copy-to-clipboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { InfoItem } from './info-item';

export function CustomerAdditionalWidget({ customer }) {
  const {
    _id,
    transporterCode,
    invoicePrefix,
    invoiceSuffix,
    currentInvoiceSerialNumber,
    invoiceDueInDays,
  } = customer || {};

  const nextInvoiceNumber = `${invoicePrefix || ''}${
    typeof currentInvoiceSerialNumber === 'number' ? currentInvoiceSerialNumber + 1 : ''
  }${invoiceSuffix || ''}`;

  const handleCopy = useCallback(() => {
    const text = JSON.stringify(
      {
        transporterCode,
        invoicePrefix,
        invoiceSuffix,
        currentInvoiceSerialNumber,
        nextInvoiceNumber,
        invoiceDueInDays,
      },
      null,
      2
    );
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [
    currentInvoiceSerialNumber,
    invoiceDueInDays,
    invoicePrefix,
    invoiceSuffix,
    nextInvoiceNumber,
    transporterCode,
  ]);

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
        <InfoItem label="Transporter Code" value={transporterCode} width={180} />
        <InfoItem label="Invoice Prefix" value={invoicePrefix} width={180} />
        <InfoItem label="Invoice Suffix" value={invoiceSuffix} width={180} />
        <InfoItem label="Current Serial No" value={currentInvoiceSerialNumber} width={180} />
        <InfoItem
          label="Next Invoice No"
          value={<Label color="primary">{nextInvoiceNumber}</Label>}
          width={180}
        />
        <InfoItem label="Invoice Due (days)" value={invoiceDueInDays} width={180} />
      </Stack>
    </Card>
  );
}

export default CustomerAdditionalWidget;
