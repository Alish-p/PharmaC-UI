import { useState, useEffect, useCallback } from 'react';

import { usePathname } from 'src/routes/hooks';
import { isExternalLink } from 'src/routes/utils';
import { useActiveLink } from 'src/routes/hooks/use-active-link';

import { useAuthContext } from 'src/auth/hooks';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../classes';
import { NavUl, NavLi, NavCollapse } from '../styles';

// ----------------------------------------------------------------------

// 1) Utility permission checks
function canUserAccessAnyAction(user, resource) {
  const resourcePermissions = user?.permissions?.[resource];
  if (!resourcePermissions) return false;
  return Object.values(resourcePermissions).some((val) => val === true);
}

function canUserAccessAction(user, resource, action) {
  const resourcePermissions = user?.permissions?.[resource];
  if (!resourcePermissions) return false;
  return resourcePermissions[action] === true;
}

// ----------------------------------------------------------------------

export function NavList({ data, render, depth, slotProps, enabledRootRedirect }) {
  const pathname = usePathname();

  const { user } = useAuthContext();

  const active = useActiveLink(data.path, !!data.children);

  const [openMenu, setOpenMenu] = useState(active);

  useEffect(() => {
    if (!active) {
      setOpenMenu(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      setOpenMenu((prev) => !prev);
    }
  }, [data.children]);

  // ----------------------------------------------------------------------
  // 2) Hide by role
  if (data.roles && user?.role) {
    if (!data.roles.includes(user.role)) {
      return null;
    }
  }

  // 3) Hide by permission at parent level
  if (data.resource) {
    // If user has no permission at all on that resource => hide
    if (!canUserAccessAnyAction(user, data.resource)) {
      return null;
    }
  }

  // 4) For child items, check if user has permission for each child's action
  let childItems = data.children || [];
  childItems = childItems
    .map((child) => {
      const resource = child.resource || data.resource; // fallback to parent's resource
      const { action } = child;

      // If child explicitly requires an action, check it
      if (action && resource) {
        if (!canUserAccessAction(user, resource, action)) {
          return null;
        }
      }

      return child;
    })
    .filter(Boolean);

  // Optionally, if `data.children` is just for sub-routes and the parent
  // shouldn't appear if no children remain, you can hide the parent:
  if (data.children && childItems.length === 0) {
    return null;
  }

  // ----------------------------------------------------------------------
  // 5) Render the main nav item
  const renderNavItem = (
    <NavItem
      render={render}
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      depth={depth}
      active={active}
      disabled={data.disabled}
      hasChild={!!data.children}
      open={data.children && openMenu}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      onClick={handleToggleMenu}
    />
  );

  // ----------------------------------------------------------------------
  // 6) If has children, render them in a NavCollapse
  if (childItems.length > 0) {
    return (
      <NavLi
        disabled={data.disabled}
        sx={{
          [`& .${navSectionClasses.li}`]: {
            '&:first-of-type': { mt: 'var(--nav-item-gap)' },
          },
        }}
      >
        {renderNavItem}

        <NavCollapse data-group={data.title} in={openMenu} depth={depth} unmountOnExit mountOnEnter>
          <NavSubList
            data={childItems}
            render={render}
            depth={depth}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
          />
        </NavCollapse>
      </NavLi>
    );
  }

  // ----------------------------------------------------------------------
  // 7) Otherwise, render a leaf NavItem
  return <NavLi disabled={data.disabled}>{renderNavItem}</NavLi>;
}

// ----------------------------------------------------------------------

function NavSubList({ data, render, depth, slotProps, enabledRootRedirect }) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          slotProps={slotProps}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
