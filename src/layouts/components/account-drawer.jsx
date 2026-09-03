import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { SvgIcon } from '@mui/material';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings/context';

import { useAuthContext } from 'src/auth/hooks';

import { paths } from '../../routes/paths';
import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export function AccountDrawer({ sx, ...other }) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const { user } = useAuthContext();

  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClickItem = useCallback(
    (path) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );

  const userName = user?.name || user?.displayName;

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: user?.photoURL, alt: userName },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {userName?.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  return (
    <>
      <AccountButton
        open={open}
        onClick={handleOpenDrawer}
        photoURL={user?.photoURL}
        displayName={userName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        <IconButton
          onClick={handleCloseDrawer}
          sx={{ top: 12, left: 12, zIndex: 9, position: 'absolute' }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Stack alignItems="center" sx={{ py: 8 }}>
            {renderAvatar}

            <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
              {user?.name}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {user?.email}
            </Typography>

            <Typography variant="subtitle2" sx={{ color: 'success.main', mt: 1 }} noWrap>
              {user?.designation}
            </Typography>
          </Stack>

          <Stack
            sx={{
              py: 3,
              px: 2.5,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <MenuItem
              onClick={() => handleClickItem(paths.dashboard.root)}
              sx={{
                py: 1,
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <Iconify icon="solar:home-angle-bold-duotone" />

              <Box component="span" sx={{ ml: 2 }}>
                Home
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleClickItem(paths.dashboard.user.details(user?._id))}
              sx={{
                py: 1,
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <SvgIcon>
                <path
                  opacity="0.5"
                  d="M2.28099 19.6575C2.36966 20.5161 2.93261 21.1957 3.77688 21.3755C5.1095 21.6592 7.6216 22 12 22C16.3784 22 18.8905 21.6592 20.2232 21.3755C21.0674 21.1957 21.6303 20.5161 21.719 19.6575C21.8505 18.3844 22 16.0469 22 12C22 7.95305 21.8505 5.6156 21.719 4.34251C21.6303 3.48389 21.0674 2.80424 20.2231 2.62451C18.8905 2.34081 16.3784 2 12 2C7.6216 2 5.1095 2.34081 3.77688 2.62451C2.93261 2.80424 2.36966 3.48389 2.28099 4.34251C2.14952 5.6156 2 7.95305 2 12C2 16.0469 2.14952 18.3844 2.28099 19.6575Z"
                  fill="currentColor"
                />
                <path
                  d="M13.9382 13.8559C15.263 13.1583 16.1663 11.7679 16.1663 10.1666C16.1663 7.8655 14.3008 6 11.9996 6C9.69841 6 7.83291 7.8655 7.83291 10.1666C7.83291 11.768 8.73626 13.1584 10.0612 13.856C8.28691 14.532 6.93216 16.1092 6.51251 18.0529C6.45446 18.3219 6.60246 18.5981 6.87341 18.6471C7.84581 18.8231 9.45616 19 12.0006 19C14.545 19 16.1554 18.8231 17.1278 18.6471C17.3977 18.5983 17.5454 18.3231 17.4876 18.0551C17.0685 16.1103 15.7133 14.5321 13.9382 13.8559Z"
                  fill="currentColor"
                />
              </SvgIcon>

              <Box component="span" sx={{ ml: 2 }}>
                Profile
              </Box>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseDrawer();
                settings.onToggleDrawer();
              }}
              sx={{
                py: 1,
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <Badge color="error" variant="dot" invisible={!settings.canReset}>
                <Iconify icon="catppuccin:folder-themes" />
              </Badge>

              <Box component="span" sx={{ ml: 2 }}>
                Appearance & theme
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleClickItem(paths.dashboard.tenant)}
              sx={{
                py: 1,
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <Iconify icon="solar:settings-bold-duotone" />
              <Box component="span" sx={{ ml: 2 }}>
                Company Settings
              </Box>
            </MenuItem>

            <MenuItem
              onClick={() => handleClickItem(paths.dashboard.paymentHistory)}
              sx={{
                py: 1,
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <Iconify icon="solar:bill-list-bold-duotone" />
              <Box component="span" sx={{ ml: 2 }}>
                Payments
              </Box>
            </MenuItem>
          </Stack>

          <Box sx={{ px: 2.5, py: 3, mt: 30 }}>
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
