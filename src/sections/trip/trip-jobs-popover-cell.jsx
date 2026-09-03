import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP = {
  loaded: 'info',
  'in transit': 'warning',
  unloaded: 'success',
  billed: 'success',
  settled: 'default',
  default: 'default',
};

export function JobsPopoverCell({ row }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const subtrips = row.subtrips || [];
  const count = subtrips.length;

  if (!count) {
    return (
      <Label variant="soft" color="default">
        0
      </Label>
    );
  }

  const sorted = [...subtrips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return (
    <>
      <Tooltip title="View jobs" arrow>
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
            <Iconify icon="mdi:truck-cargo-container" width={20} color="primary.main" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Jobs in Trip{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {row.tripNo}
              </Box>
            </Typography>
          </Stack>
          <Chip size="small" label={`${count} Jobs`} color="primary" variant="soft" />
        </Box>

        {/* Job list */}
        <Box sx={{ maxHeight: 380, overflow: 'auto', px: 2, py: 1.5 }}>
          {sorted.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Iconify
                icon="mdi:clipboard-off-outline"
                width={36}
                sx={{ color: 'text.disabled', mb: 1 }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No jobs found in this trip.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {sorted.map((st, idx, arr) => {
                const driverName =
                  st?.driverId?.driverName ||
                  st?.driver?.driverName ||
                  st?.driverName ||
                  (typeof st?.driver === 'string' ? st.driver : undefined) ||
                  row?.driverId?.driverName ||
                  '-';

                const statusRaw = (st.subtripStatus || '').replace(/-/g, ' ');
                const statusColor =
                  STATUS_COLOR_MAP[statusRaw.toLowerCase()] || STATUS_COLOR_MAP.default;

                return (
                  <Box key={st._id || idx}>
                    <Box
                      sx={{
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1.5,
                        bgcolor: 'background.paper',
                        transition: 'box-shadow 0.15s',
                        '&:hover': {
                          boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[4],
                        },
                      }}
                    >
                      {/* Top row: LR + Status */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Iconify
                            icon="mdi:file-document-outline"
                            width={15}
                            sx={{ color: 'text.secondary' }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            LR
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {st.subtripNo || '-'}
                          </Typography>
                        </Stack>
                        <Chip
                          size="small"
                          label={statusRaw || '-'}
                          color={statusColor}
                          variant="soft"
                          sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.68rem' }}
                        />
                      </Stack>

                      {/* Customer */}
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={0.75}
                        sx={{ mb: 0.75 }}
                      >
                        <Iconify
                          icon="mdi:domain"
                          width={14}
                          sx={{ color: 'text.disabled', mt: '2px', flexShrink: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.4 }}
                        >
                          {st.customerId?.customerName || '-'}
                        </Typography>
                      </Stack>

                      {/* Route */}
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                        <Iconify
                          icon="mdi:map-marker-outline"
                          width={14}
                          sx={{ color: 'text.disabled', flexShrink: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 150,
                          }}
                        >
                          {st.loadingPoint || '—'}
                        </Typography>
                        <Iconify
                          icon="mdi:arrow-right"
                          width={13}
                          sx={{ color: 'text.disabled', flexShrink: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 150,
                          }}
                        >
                          {st.unloadingPoint || '—'}
                        </Typography>
                      </Stack>

                      {/* Date + Driver */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify
                            icon="mdi:calendar-outline"
                            width={13}
                            sx={{ color: 'text.disabled' }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {st.startDate ? fDate(new Date(st.startDate)) : '-'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Avatar
                            sx={{
                              width: 16,
                              height: 16,
                              fontSize: '0.6rem',
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                            }}
                          >
                            {driverName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {driverName}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    {idx < arr.length - 1 && <Divider sx={{ mt: 1.25 }} />}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
}
