import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { ICONS } from 'src/assets/data/icons';

import { Iconify } from 'src/components/iconify';

export default function TyreGeneralInfo({ tyre, ...other }) {
  const renderItem = (icon, label, value) => (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Iconify icon={icon} width={24} sx={{ color: 'text.secondary' }} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" noWrap>
          {value || '-'}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Card {...other}>
      <CardHeader title="General Information" />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          {renderItem(ICONS.common.bookmark, 'Brand', tyre.brand)}
          {renderItem(ICONS.common.tag, 'Model', tyre.model)}
          {renderItem(ICONS.tyre.ruler, 'Size', tyre.size)}
          {renderItem(ICONS.tyre.code, 'Serial Number', tyre.serialNumber)}
          {renderItem(ICONS.common.dollar, 'Cost', tyre.cost)}
          {renderItem(ICONS.common.fileText, 'PO Number', tyre.purchaseOrderNumber)}
          {renderItem(
            ICONS.common.calendar,
            'Purchase Date',
            tyre.purchaseDate ? new Date(tyre.purchaseDate).toLocaleDateString() : '-'
          )}
          {renderItem(ICONS.tyre.tyre, 'Type', tyre.type)}
        </Box>

        {tyre.metadata && (
          <Box sx={{ pt: 2, borderTop: (theme) => `dashed 1px ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Metadata
            </Typography>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {renderItem(ICONS.common.refresh, 'Remold Count', tyre.metadata.remoldCount)}
              {renderItem(
                ICONS.common.checkCircle,
                'Remoldable',
                tyre.metadata.isRemoldable ? 'Yes' : 'No'
              )}
            </Box>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
