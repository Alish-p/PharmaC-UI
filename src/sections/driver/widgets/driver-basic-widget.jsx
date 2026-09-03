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

export function DriverBasicWidget({ driver }) {
  const { _id, driverName, driverLicenceNo, driverCellNo, driverPresentAddress, permanentAddress } =
    driver || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify(
      { driverName, driverLicenceNo, driverCellNo, driverPresentAddress, permanentAddress },
      null,
      2
    );
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [driverCellNo, driverLicenceNo, driverName, driverPresentAddress, permanentAddress]);

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
              <IconButton component={RouterLink} href={paths.dashboard.driver.edit(_id)}>
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
        <InfoItem label="Driver Name" value={driverName} />
        <InfoItem label="Licence No" value={driverLicenceNo} />
        <InfoItem label="Mobile" value={driverCellNo} />
        <InfoItem label="Present Address" value={driverPresentAddress} />
        <InfoItem label="Permanent Address" value={permanentAddress} />
      </Stack>
    </Card>
  );
}

export default DriverBasicWidget;
