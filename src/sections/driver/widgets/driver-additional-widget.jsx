import { useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { copyToClipboard } from 'src/utils/copy-to-clipboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { InfoItem } from './info-item';

export function DriverAdditionalWidget({ driver }) {
  const { _id, licenseFrom, licenseTo, experience, dob, aadharNo, guarantorName, guarantorCellNo } =
    driver || {};

  const handleCopy = useCallback(() => {
    const text = JSON.stringify(
      { licenseFrom, licenseTo, experience, dob, aadharNo, guarantorName, guarantorCellNo },
      null,
      2
    );
    copyToClipboard(text);
    toast.success('Copied to clipboard');
  }, [aadharNo, dob, experience, guarantorCellNo, guarantorName, licenseFrom, licenseTo]);

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
        <InfoItem label="License From" value={fDate(licenseFrom)} />
        <InfoItem label="License To" value={fDate(licenseTo)} />
        <InfoItem label="Experience" value={experience} />
        <InfoItem label="Date of Birth" value={fDate(dob)} />
        <InfoItem label="Aadhar No" value={aadharNo} />
        <InfoItem label="Guarantor Name" value={guarantorName} />
        <InfoItem label="Guarantor Cell No" value={guarantorCellNo} />
      </Stack>
    </Card>
  );
}

export default DriverAdditionalWidget;
