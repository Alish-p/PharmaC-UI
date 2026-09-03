import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components/router-link';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function VehicleCard({ vehicle, sx }) {
  const { _id, vehicleNo, vehicleType, noOfTyres, trackingLink, isOwn, transporter } =
    vehicle || {};

  const handleTracking = () => {
    if (trackingLink) {
      window.open(trackingLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      sx={{
        p: 2.5,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8],
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      <Stack spacing={2}>
        {/* Category Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Vehicle Information
          </Typography>
        </Box>

        {/* Header Section */}
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.16)}`,
            }}
          >
            <Iconify icon="mdi:truck-outline" width={32} sx={{ color: 'primary.main' }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: '1.125rem',
                mb: 0.5,
              }}
            >
              {vehicleNo || 'Unknown Vehicle'}
            </Typography>

            {/* Vehicle Type & Tyres */}
            {vehicleType && (
              <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                <Iconify icon="solar:car-bold" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {vehicleType}
                  {noOfTyres && ` • ${noOfTyres} Tyres`}
                </Typography>
              </Stack>
            )}

            {/* Ownership Badge */}
            <Chip
              label={isOwn ? 'Own Vehicle' : 'Market Vehicle'}
              size="small"
              variant="soft"
              color={isOwn ? 'secondary' : 'warning'}
              sx={{ height: 22, fontWeight: 600 }}
            />
          </Box>

          {_id && (
            <Tooltip title="View details" arrow>
              <IconButton
                size="small"
                component={RouterLink}
                href={paths.dashboard.vehicle.details(_id)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Iconify icon="solar:arrow-right-linear" width={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Transporter Info */}
        {!isOwn && transporter?.transportName && (
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
              borderRadius: 1.5,
              border: 1,
              borderColor: (theme) => alpha(theme.palette.warning.main, 0.24),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:user-bold" width={18} sx={{ color: 'warning.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Transporter
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {transporter.transportName}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Action Button */}
        {trackingLink && (
          <Stack direction="row" spacing={1} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Tooltip title="Track vehicle location" arrow>
              <Box sx={{ flex: 1 }}>
                <IconButton
                  fullWidth
                  onClick={handleTracking}
                  sx={{
                    width: '100%',
                    py: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'info.main',
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                      '& .MuiSvgIcon-root': {
                        color: 'info.main',
                      },
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon="solar:map-point-bold"
                      width={20}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Track Vehicle
                    </Typography>
                  </Stack>
                </IconButton>
              </Box>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
