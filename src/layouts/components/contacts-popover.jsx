import dayjs from 'dayjs';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import SvgIcon from '@mui/material/SvgIcon';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';

import { fToNow } from 'src/utils/format-time';

import { useUsersLastSeen } from 'src/query/use-user';

import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const StyledBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'online' ? '#44b700' : '#8e8e93',
    color: status === 'online' ? '#44b700' : '#8e8e93',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    boxShadow: theme.shadows[4],
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

export function ContactsPopover({ sx, ...other }) {
  const popover = usePopover();
  const { data: users = [], isLoading } = useUsersLastSeen();

  const processedData = users.map((user) => {
    const isOnline = user.lastSeen && dayjs().diff(user.lastSeen, 'minute') <= 5;
    const isRecentlyActive = user.lastSeen && dayjs().diff(user.lastSeen, 'hour') <= 1;

    return {
      id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      lastActivity: user.lastSeen,
      status: isOnline ? 'online' : 'offline',
      isRecentlyActive,
    };
  });

  // Sort users: online first, then recently active, then by name
  const sortedData = processedData.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'online' ? -1 : 1;
    }
    if (a.isRecentlyActive !== b.isRecentlyActive) {
      return a.isRecentlyActive ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const onlineCount = processedData.filter((user) => user.status === 'online').length;

  const getStatusText = (contact) => {
    if (contact.status === 'online') {
      return 'Active now';
    }
    if (contact.lastActivity) {
      return `Last seen ${fToNow(contact.lastActivity)} ago`;
    }
    return 'Offline';
  };

  return (
    <>
      <StyledIconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.02)}
        onClick={popover.onOpen}
        sx={{
          ...(popover.open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            boxShadow: (theme) => theme.shadows[8],
          }),
          ...sx,
        }}
        {...other}
      >
        <Badge
          badgeContent={onlineCount}
          color="success"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: '18px',
              height: '18px',
              fontWeight: 600,
            },
          }}
        >
          <SvgIcon sx={{ width: 24, height: 24 }}>
            {/* Enhanced users icon */}
            <circle cx="15" cy="6" r="3" fill="currentColor" opacity="0.4" />
            <ellipse cx="16" cy="17" fill="currentColor" opacity="0.4" rx="5" ry="3" />
            <circle cx="9.001" cy="6" r="4" fill="currentColor" />
            <ellipse cx="9.001" cy="17.001" fill="currentColor" rx="7" ry="4" />
          </SvgIcon>
        </Badge>
      </StyledIconButton>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[20],
            },
          },
          arrow: { placement: 'right-bottom' },
        }}
      >
        <HeaderContainer>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sortedData.length} total
            </Typography>
          </Box>

          {onlineCount > 0 && (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
              {onlineCount} online now
            </Typography>
          )}
        </HeaderContainer>

        <Scrollbar sx={{ height: 320 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography color="text.secondary">Loading contacts...</Typography>
            </Box>
          ) : sortedData.length === 0 ? (
            <EmptyState>
              <SvgIcon sx={{ width: 48, height: 48, mb: 2, opacity: 0.5 }}>
                <circle cx="15" cy="6" r="3" fill="currentColor" opacity="0.4" />
                <ellipse cx="16" cy="17" fill="currentColor" opacity="0.4" rx="5" ry="3" />
                <circle cx="9.001" cy="6" r="4" fill="currentColor" />
                <ellipse cx="9.001" cy="17.001" fill="currentColor" rx="7" ry="4" />
              </SvgIcon>
              <Typography variant="body2">No team members found</Typography>
            </EmptyState>
          ) : (
            sortedData.map((contact, index) => (
              <Box key={contact.id}>
                <StyledMenuItem>
                  <StyledBadge
                    variant="dot"
                    status={contact.status}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{ mr: 2 }}
                  >
                    <Avatar
                      src={contact?.avatarUrl}
                      alt={contact?.name}
                      sx={{
                        width: 44,
                        height: 44,
                        border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      {contact?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </StyledBadge>

                  <ListItemText
                    primary={contact.name}
                    secondary={getStatusText(contact)}
                    primaryTypographyProps={{
                      variant: 'subtitle2',
                      fontWeight: 500,
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: contact.status === 'online' ? 'success.main' : 'text.secondary',
                      noWrap: true,
                    }}
                  />
                </StyledMenuItem>

                {/* Add subtle divider between online and offline users */}
                {index < sortedData.length - 1 &&
                  sortedData[index].status === 'online' &&
                  sortedData[index + 1].status === 'offline' && (
                    <Divider sx={{ mx: 2, my: 1, opacity: 0.5 }} />
                  )}
              </Box>
            ))
          )}
        </Scrollbar>
      </CustomPopover>
    </>
  );
}
