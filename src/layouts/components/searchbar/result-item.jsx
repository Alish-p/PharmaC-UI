import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function ResultItem({ title, breadcrumbs, groupLabel, onClickItem, isActive, icon }) {
  const itemRef = useRef(null);

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  return (
    <ListItemButton
      ref={itemRef}
      onClick={onClickItem}
      sx={{
        outline: 'none',
        borderTop: '1px solid transparent',
        borderRight: '1px solid transparent',
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderLeft: '3px solid transparent',
        borderRadius: 0,
        '&:focus, &:focus-visible': {
          outline: 'none',
        },
        '&:hover': {
          borderRadius: '0px 8px 8px 0px',
          borderLeftColor: (theme) => theme.vars.palette.primary.main,
          backgroundColor: (theme) =>
            varAlpha(
              theme.vars.palette.primary.mainChannel,
              theme.vars.palette.action.hoverOpacity
            ),
        },
        ...(isActive && {
          borderRadius: '0px 8px 8px 0px',
          borderLeftColor: (theme) => theme.vars.palette.primary.main,
          backgroundColor: (theme) =>
            varAlpha(
              theme.vars.palette.primary.mainChannel,
              0.08
            ),
        }),
      }}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            mr: 1.5,
            width: 24,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            ...(isActive && {
              color: 'primary.main',
            }),
          }}
        >
          {icon}
        </Box>
      )}

      <ListItemText
        primaryTypographyProps={{ typography: 'subtitle2', sx: { textTransform: 'capitalize' } }}
        secondaryTypographyProps={{ typography: 'caption', noWrap: true }}
        primary={title.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{ color: part.highlight ? 'primary.main' : 'text.primary' }}
          >
            {part.text}
          </Box>
        ))}
        secondary={breadcrumbs.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{ color: part.highlight ? 'primary.main' : 'text.secondary' }}
          >
            {part.text}
          </Box>
        ))}
      />

      {groupLabel && <Label color="info">{groupLabel}</Label>}
    </ListItemButton>
  );
}

