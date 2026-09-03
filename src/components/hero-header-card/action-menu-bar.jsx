import React from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// actions: [{ label, icon, onClick, disabled }]
// menus: [{ label, icon, items: [{ label, icon, onClick, disabled, tooltip, render }] }]
export function ActionMenuBar({ actions = [], menus = [], collapseAt = 'md' }) {
  const theme = useTheme();
  const upBreakpoint = useMediaQuery(theme.breakpoints.up(collapseAt));

  const popover = usePopover();
  const [activeMenuIndex, setActiveMenuIndex] = React.useState(null);

  const onOpenMenu = (index, event) => {
    setActiveMenuIndex(index);
    popover.onOpen(event);
  };

  const activeMenu = activeMenuIndex != null ? menus[activeMenuIndex] : null;

  // Desktop: individual buttons per menu and action
  if (upBreakpoint) {
    return (
      <>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {menus.map((menu, idx) => (
            <Button
              key={menu.label}
              color="primary"
              variant="outlined"
              startIcon={menu.icon ? <Iconify icon={menu.icon} /> : null}
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              onClick={(e) => onOpenMenu(idx, e)}
              sx={{ textTransform: 'capitalize' }}
            >
              {menu.label}
            </Button>
          ))}

          {actions.map((action) => (
            <Button
              key={action.label}
              color={action.color || 'primary'}
              variant={action.variant || 'outlined'}
              startIcon={action.icon ? <Iconify icon={action.icon} /> : null}
              onClick={action.onClick}
              disabled={action.disabled}
              sx={{ textTransform: 'capitalize' }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>

        <CustomPopover
          open={popover.open}
          onClose={() => {
            setActiveMenuIndex(null);
            popover.onClose();
          }}
          anchorEl={popover.anchorEl}
          slotProps={{ arrow: { placement: 'right-top' } }}
        >
          {activeMenu && (
            <MenuList>
              {activeMenu.items.map((item) => {
                const content = item.render ? null : (
                  <>
                    {item.icon && <Iconify icon={item.icon} sx={{ mr: 1.5 }} />}
                    {item.label}
                  </>
                );

                const handleClick = () => {
                  if (item.onClick) item.onClick();
                  setActiveMenuIndex(null);
                  popover.onClose();
                };

                const node = (
                  <MenuItem
                    key={item.label}
                    disabled={item.disabled}
                    onClick={item.render ? undefined : handleClick}
                  >
                    {item.render
                      ? item.render({
                          close: () => {
                            setActiveMenuIndex(null);
                            popover.onClose();
                          },
                        })
                      : content}
                  </MenuItem>
                );

                return item.tooltip ? (
                  <Tooltip
                    key={item.label}
                    title={item.tooltip}
                    disableHoverListener={!item.disabled}
                    disableFocusListener={!item.disabled}
                    disableTouchListener={!item.disabled}
                  >
                    <span>{node}</span>
                  </Tooltip>
                ) : (
                  node
                );
              })}
            </MenuList>
          )}
        </CustomPopover>
      </>
    );
  }

  // Mobile: single hamburger menu aggregating all
  return (
    <>
      <IconButton color="inherit" onClick={(e) => onOpenMenu(-1, e)}>
        <Iconify icon="eva:menu-fill" />
      </IconButton>
      <CustomPopover
        open={popover.open}
        onClose={() => {
          setActiveMenuIndex(null);
          popover.onClose();
        }}
        anchorEl={popover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList sx={{ minWidth: 220 }}>
          {menus.map((menu, mIdx) => (
            <React.Fragment key={menu.label}>
              {mIdx > 0 && <Divider sx={{ my: 0.5 }} />}
              <MenuItem disabled sx={{ opacity: 0.72, fontWeight: 600 }}>
                {menu.icon && <Iconify icon={menu.icon} sx={{ mr: 1.5 }} />}
                {menu.label}
              </MenuItem>
              {menu.items.map((item) => {
                const content = item.render ? null : (
                  <>
                    {item.icon && <Iconify icon={item.icon} sx={{ mr: 1.5 }} />}
                    {item.label}
                  </>
                );

                const handleClick = () => {
                  if (item.onClick) item.onClick();
                  setActiveMenuIndex(null);
                  popover.onClose();
                };

                const node = (
                  <MenuItem
                    key={item.label}
                    disabled={item.disabled}
                    onClick={item.render ? undefined : handleClick}
                  >
                    {item.render
                      ? item.render({
                          close: () => {
                            setActiveMenuIndex(null);
                            popover.onClose();
                          },
                        })
                      : content}
                  </MenuItem>
                );

                return item.tooltip ? (
                  <Tooltip
                    key={item.label}
                    title={item.tooltip}
                    disableHoverListener={!item.disabled}
                    disableFocusListener={!item.disabled}
                    disableTouchListener={!item.disabled}
                  >
                    <span>{node}</span>
                  </Tooltip>
                ) : (
                  node
                );
              })}
            </React.Fragment>
          ))}

          {actions.length > 0 && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem disabled sx={{ opacity: 0.72, fontWeight: 600 }}>
                Quick Actions
              </MenuItem>
              {actions.map((action) => (
                <MenuItem
                  key={action.label}
                  disabled={action.disabled}
                  onClick={() => {
                    if (action.onClick) action.onClick();
                    setActiveMenuIndex(null);
                    popover.onClose();
                  }}
                >
                  {action.icon && <Iconify icon={action.icon} sx={{ mr: 1.5 }} />}
                  {action.label}
                </MenuItem>
              ))}
            </>
          )}
        </MenuList>
      </CustomPopover>
    </>
  );
}

export default ActionMenuBar;
