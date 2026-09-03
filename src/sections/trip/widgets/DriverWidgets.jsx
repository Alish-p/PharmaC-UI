import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components/router-link';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DriverCard({ driver, sx }) {
  const { _id, driverName, driverCellNo } = driver || {};

  const initials = (driverName || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const whatsappNumber = (driverCellNo || '').replace(/\D/g, '');
  const hasPhone = Boolean(driverCellNo);

  const handleCall = () => {
    if (driverCellNo) {
      window.location.href = `tel:${driverCellNo}`;
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer');
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
          <Iconify icon="solar:steering-wheel-bold" width={18} sx={{ color: 'primary.main' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Driver Information
          </Typography>
        </Box>

        {/* Header Section */}
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 600,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: '1.125rem',
              }}
            >
              {driverName || 'Unknown Driver'}
            </Typography>

            {hasPhone ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:phone-bold" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {driverCellNo}
                </Typography>
              </Stack>
            ) : (
              <Chip
                label="No contact"
                size="small"
                variant="outlined"
                color="warning"
                sx={{ height: 22 }}
              />
            )}
          </Box>

          {_id && (
            <Tooltip title="View details" arrow>
              <IconButton
                size="small"
                component={RouterLink}
                href={paths.dashboard.driver.details(_id)}
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

        {/* Action Buttons */}
        {hasPhone && (
          <Stack direction="row" spacing={1} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Tooltip title="Call driver" arrow>
              <Box sx={{ flex: 1 }}>
                <IconButton
                  fullWidth
                  onClick={handleCall}
                  sx={{
                    width: '100%',
                    py: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      '& .MuiSvgIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon="solar:phone-calling-bold"
                      width={20}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Call
                    </Typography>
                  </Stack>
                </IconButton>
              </Box>
            </Tooltip>

            <Tooltip title="WhatsApp" arrow>
              <Box sx={{ flex: 1 }}>
                <IconButton
                  fullWidth
                  onClick={handleWhatsApp}
                  disabled={!whatsappNumber}
                  sx={{
                    width: '100%',
                    py: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'success.main',
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                      '& .MuiSvgIcon-root': {
                        color: 'success.main',
                      },
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon="ic:baseline-whatsapp"
                      width={20}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      WhatsApp
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
