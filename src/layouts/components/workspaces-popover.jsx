import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';
import { useTenantContext } from 'src/auth/tenant';

// ----------------------------------------------------------------------

export function WorkspacesPopover({ data = [], sx, ...other }) {
  const popover = usePopover();
  const tenant = useTenantContext();
  const { accessibleTenants = [], switchTenant } = useAuthContext();
  const [switchingId, setSwitchingId] = useState(null);

  const mediaQuery = 'sm';

  // Ensure current active tenant is in the list
  const companies = accessibleTenants.length > 0
    ? accessibleTenants
    : tenant ? [tenant] : data;

  const currentTenantId = tenant?._id ? String(tenant._id) : null;
  const isMultiTenant = companies.length > 1;

  const handleSwitchTenant = useCallback(
    async (targetTenantId) => {
      if (!targetTenantId || targetTenantId === currentTenantId) {
        popover.onClose();
        return;
      }
      try {
        setSwitchingId(targetTenantId);
        await switchTenant(targetTenantId);
      } catch (err) {
        console.error('Failed to switch tenant:', err);
        setSwitchingId(null);
      }
    },
    [currentTenantId, switchTenant, popover]
  );

  return (
    <>
      <ButtonBase
        onClick={isMultiTenant ? popover.onOpen : undefined}
        sx={{
          py: 0.5,
          px: 1,
          borderRadius: 1,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          cursor: isMultiTenant ? 'pointer' : 'default',
          transition: (theme) => theme.transitions.create(['background-color']),
          '&:hover': isMultiTenant
            ? {
              backgroundColor: 'action.hover',
            }
            : {},
          ...sx,
        }}
        {...other}
      >
        <Box
          component="img"
          alt={tenant?.name || 'Company'}
          src={getTenantLogoUrl(tenant)}
          sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
        />

        <Box
          component="span"
          sx={{
            typography: 'subtitle2',
            display: { xs: 'none', [mediaQuery]: 'inline-flex' },
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tenant?.name || 'My Company'}
        </Box>

        {tenant?.subscription?.planName && (
          <Label
            color={tenant?.subscription?.planName === 'Free' ? 'default' : 'info'}
            sx={{
              height: 22,
              display: { xs: 'none', [mediaQuery]: 'inline-flex' },
            }}
          >
            {tenant?.subscription?.planName}
          </Label>
        )}

        {isMultiTenant && (
          <Iconify
            icon="eva:arrow-ios-downward-fill"
            sx={{
              width: 16,
              height: 16,
              color: 'text.secondary',
              display: { xs: 'none', [mediaQuery]: 'inline-flex' },
            }}
          />
        )}
      </ButtonBase>

      {isMultiTenant && (
        <CustomPopover
          open={popover.open}
          anchorEl={popover.anchorEl}
          onClose={popover.onClose}
          slotProps={{
            paper: { sx: { p: 0, width: 280 } },
            arrow: { offset: 20 },
          }}
        >
          <MenuList sx={{ p: 1 }}>
            {companies.map((company) => {
              const companyId = company._id ? String(company._id) : null;
              const isActive = companyId === currentTenantId;
              const isSwitching = switchingId === companyId;

              return (
                <MenuItem
                  key={companyId || company.slug}
                  selected={isActive}
                  disabled={isSwitching}
                  onClick={() => handleSwitchTenant(companyId)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 0.75,
                    mb: 0.5,
                    gap: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      fontWeight: 'fontWeightBold',
                    },
                  }}
                >
                  <Avatar
                    alt={company.name}
                    src={getTenantLogoUrl(company)}
                    sx={{ width: 32, height: 32, fontSize: 14 }}
                  >
                    {company.name?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <ListItemText
                    primary={company.name}
                    primaryTypographyProps={{
                      variant: 'body2',
                      noWrap: true,
                      sx: { fontWeight: isActive ? 'fontWeightSemiBold' : 'fontWeightRegular' },
                    }}
                  />

                  {isSwitching && <CircularProgress size={16} />}

                  {isActive && !isSwitching && (
                    <Iconify
                      icon="eva:checkmark-fill"
                      sx={{ color: 'primary.main', width: 20, height: 20, flexShrink: 0 }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </MenuList>
        </CustomPopover>
      )}
    </>
  );
}
