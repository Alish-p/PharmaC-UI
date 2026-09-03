import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ---------------------------------------------------------------------------

export function WorkOrderPartsPopoverCell({ row }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const parts = row.parts || [];
  const count = parts.length;
  const totalAmount = parts.reduce((acc, line) => acc + (line.amount || 0), 0);

  if (!count) {
    return (
      <Label variant="soft" color="default">
        0
      </Label>
    );
  }

  return (
    <>
      <Tooltip title="View parts" arrow>
        <Label
          variant="soft"
          color="info"
          sx={{ cursor: 'pointer' }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {count}
        </Label>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 460,
            maxWidth: '95vw',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows?.dialog || theme.shadows[16],
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:tools" width={20} color="primary.main" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Parts Used in{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {row.workOrderNo}
              </Box>
            </Typography>
          </Stack>
          <Chip size="small" label={`${count} Parts`} color="primary" variant="soft" />
        </Box>

        {/* Parts list */}
        <Scrollbar sx={{ maxHeight: 380 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Part Name</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.map((line, idx) => {
                const displayPartName =
                  line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
                const displayUnit =
                  line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';

                return (
                  <TableRow key={line._id || idx} hover>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="mdi:nut"
                          width={16}
                          sx={{ color: 'text.secondary', flexShrink: 0 }}
                        />
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                          {displayPartName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {line.quantity || 0} {displayUnit !== '-' ? displayUnit : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="subtitle2">{fCurrency(line.amount || 0)}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={2} align="right">
                  <Typography variant="subtitle2">Total Amount</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" color="primary.main">
                    {fCurrency(totalAmount)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </Popover>
    </>
  );
}
