import dayjs from 'dayjs';
import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { allLangs } from 'src/locales';
import { _notifications } from 'src/_mock';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { bulletColor } from 'src/components/nav-section';
import { useSettingsContext } from 'src/components/settings';

import { useAuthContext } from 'src/auth/hooks';
import { useTenantContext } from 'src/auth/tenant';

import { Main } from './main';
import { NavMobile } from './nav-mobile';
import { layoutClasses } from '../classes';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../config-nav-account';
import { HeaderBase } from '../core/header-base';
import { useNavBadges } from './hooks/use-nav-badges';
import { _workspaces } from '../config-nav-workspace';
import { LayoutSection } from '../core/layout-section';
import { navData as dashboardNavData } from '../config-nav-dashboard';

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, children, data }) {
  const theme = useTheme();

  const mobileNavOpen = useBoolean();

  const settings = useSettingsContext();

  const navColorVars = useNavColorVars(theme, settings);

  const layoutQuery = 'lg';

  const tenant = useTenantContext();

  const { user } = useAuthContext();

  const { injectBadges } = useNavBadges();

  const rawNavData = data?.nav ?? dashboardNavData;

  const navData = useMemo(() => {
    const featureFiltered = filterNavByFeatures(rawNavData, tenant);
    const permissionFiltered = filterNavByPermissions(featureFiltered, user);

    return injectBadges(permissionFiltered);
  }, [rawNavData, tenant, user, injectBadges]);

  // Read optional announcement banner from env (Vite: VITE_*)
  const announcementMessage = import.meta.env.VITE_ANNOUNCEMENT_MESSAGE?.trim?.();
  const announcementSeverity = import.meta.env.VITE_ANNOUNCEMENT_SEVERITY?.trim?.() || 'info';

  const showSubscriptionExpired = useMemo(() => {
    const validTill = tenant?.subscription?.validTill;
    if (!validTill) return false;
    return dayjs().isAfter(dayjs(validTill).add(1, 'day'));
  }, [tenant?.subscription?.validTill]);

  const workspaces = [
    {
      ..._workspaces[0],
      name: tenant?.name ?? _workspaces[0].name,
      plan: 'basic',
    },
  ];

  const isNavMini = settings.navLayout === 'mini';

  const isNavHorizontal = settings.navLayout === 'horizontal';

  const isNavVertical = isNavMini || settings.navLayout === 'vertical';

  return (
    <>
      <NavMobile
        data={navData}
        open={mobileNavOpen.value}
        onClose={mobileNavOpen.onFalse}
        cssVars={navColorVars.section}
      />

      <LayoutSection
        /** **************************************
         * Header
         *************************************** */
        headerSection={
          <HeaderBase
            layoutQuery={layoutQuery}
            disableElevation={isNavVertical}
            onOpenNav={mobileNavOpen.onTrue}
            data={{
              nav: navData,
              langs: allLangs,
              account: _account,
              workspaces,
              notifications: _notifications,
            }}
            slotsDisplay={{
              signIn: false,
              purchase: false,
              helpLink: false,
            }}
            slots={{
              topArea:
                showSubscriptionExpired || announcementMessage ? (
                  <>
                    {showSubscriptionExpired && (
                      <Alert severity="info" sx={{ borderRadius: 0 }}>
                        Your subscription has expired. Please renew to continue using Tranzit.
                      </Alert>
                    )}
                    {announcementMessage && (
                      <Alert severity={announcementSeverity} sx={{ borderRadius: 0 }} icon={false}>
                        {announcementMessage}
                      </Alert>
                    )}
                  </>
                ) : null,
              bottomArea: isNavHorizontal ? (
                <NavHorizontal
                  data={navData}
                  layoutQuery={layoutQuery}
                  cssVars={navColorVars.section}
                />
              ) : null,
            }}
            slotProps={{
              toolbar: {
                sx: {
                  [`& [data-slot="logo"]`]: {
                    display: 'none',
                  },
                  [`& [data-area="right"]`]: {
                    gap: { xs: 0, sm: 0.75 },
                  },
                  ...(isNavHorizontal && {
                    bgcolor: 'var(--layout-nav-bg)',
                    [`& .${iconButtonClasses.root}`]: {
                      color: 'var(--layout-nav-text-secondary-color)',
                    },
                    [theme.breakpoints.up(layoutQuery)]: {
                      height: 'var(--layout-nav-horizontal-height)',
                    },
                    [`& [data-slot="workspaces"]`]: {
                      color: 'var(--layout-nav-text-primary-color)',
                    },
                    [`& [data-slot="logo"]`]: {
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    },
                    [`& [data-slot="divider"]`]: {
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'flex',
                      },
                    },
                  }),
                },
              },
              container: {
                maxWidth: false,
                sx: {
                  ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
                },
              },
            }}
          />
        }
        /** **************************************
         * Sidebar
         *************************************** */
        sidebarSection={
          isNavHorizontal ? null : (
            <NavVertical
              data={navData}
              isNavMini={isNavMini}
              layoutQuery={layoutQuery}
              cssVars={navColorVars.section}
              onToggleNav={() =>
                settings.onUpdateField(
                  'navLayout',
                  settings.navLayout === 'vertical' ? 'mini' : 'vertical'
                )
              }
            />
          )
        }
        /** **************************************
         * Footer
         *************************************** */
        footerSection={null}
        /** **************************************
         * Style
         *************************************** */
        cssVars={{
          ...navColorVars.layout,
          '--layout-transition-easing': 'linear',
          '--layout-transition-duration': '120ms',
          '--layout-nav-mini-width': '88px',
          '--layout-nav-vertical-width': '300px',
          '--layout-nav-horizontal-height': '64px',
          '--layout-dashboard-content-pt': theme.spacing(1),
          '--layout-dashboard-content-pb': theme.spacing(8),
          '--layout-dashboard-content-px': theme.spacing(5),
        }}
        sx={{
          [`& .${layoutClasses.hasSidebar}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
            },
          },
          ...sx,
        }}
      >
        <Main isNavHorizontal={isNavHorizontal}>{children}</Main>
      </LayoutSection>
    </>
  );
}

// ----------------------------------------------------------------------

function useNavColorVars(theme, settings) {
  const {
    vars: { palette },
  } = theme;

  return useMemo(() => {
    switch (settings.navColor) {
      case 'integrate':
        return {
          layout: {
            '--layout-nav-bg': palette.background.default,
            '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.8),
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.12),
            '--layout-nav-text-primary-color': palette.text.primary,
            '--layout-nav-text-secondary-color': palette.text.secondary,
            '--layout-nav-text-disabled-color': palette.text.disabled,
            [stylesMode.dark]: {
              '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.08),
              '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.96),
            },
          },
          section: {},
        };
      case 'apparent':
        return {
          layout: {
            '--layout-nav-bg': palette.grey[900],
            '--layout-nav-horizontal-bg': varAlpha(palette.grey['900Channel'], 0.96),
            '--layout-nav-border-color': 'transparent',
            '--layout-nav-text-primary-color': palette.common.white,
            '--layout-nav-text-secondary-color': palette.grey[500],
            '--layout-nav-text-disabled-color': palette.grey[600],
            [stylesMode.dark]: {
              '--layout-nav-bg': palette.grey[800],
              '--layout-nav-horizontal-bg': varAlpha(palette.grey['800Channel'], 0.8),
            },
          },
          section: {
            // caption
            '--nav-item-caption-color': palette.grey[600],
            // subheader
            '--nav-subheader-color': palette.grey[600],
            '--nav-subheader-hover-color': palette.common.white,
            // item
            '--nav-item-color': palette.grey[500],
            '--nav-item-root-active-color': palette.primary.light,
            '--nav-item-root-open-color': palette.common.white,
            // bullet
            '--nav-bullet-light-color': bulletColor.dark,
            // sub
            ...(settings.navLayout === 'vertical' && {
              '--nav-item-sub-active-color': palette.common.white,
              '--nav-item-sub-open-color': palette.common.white,
            }),
          },
        };
      default:
        throw new Error(`Invalid color: ${settings.navColor}`);
    }
  }, [
    palette.background.default,
    palette.background.defaultChannel,
    palette.common.white,
    palette.grey,
    palette.primary.light,
    palette.text.disabled,
    palette.text.primary,
    palette.text.secondary,
    settings.navColor,
    settings.navLayout,
  ]);
}

// ----------------------------------------------------------------------

const FEATURE_CHECKERS = {
  maintenanceAndInventory: (tenant) => !!tenant?.integrations?.maintenanceAndInventory?.enabled,
  tyre: (tenant) => !!tenant?.integrations?.tyre?.enabled,
  marketVehicle: (tenant) => {
    const mode = tenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH;
    return mode === VEHICLE_MODES.MARKET_ONLY || mode === VEHICLE_MODES.BOTH;
  },
  noMarketVehicle: (tenant) => {
    const mode = tenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH;
    return mode === VEHICLE_MODES.OWN_ONLY;
  },
  ownVehicle: (tenant) => {
    const mode = tenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH;
    return mode === VEHICLE_MODES.OWN_ONLY || mode === VEHICLE_MODES.BOTH;
  },
  noOwnVehicle: (tenant) => {
    const mode = tenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH;
    return mode === VEHICLE_MODES.MARKET_ONLY;
  },
  pumps: (tenant) => tenant?.config?.pumps !== false,
  noPumps: (tenant) => tenant?.config?.pumps === false,
};

function filterNavByFeatures(navSections, tenant) {
  if (!navSections) return [];

  const checkFeature = (feature) => {
    if (!feature) return true;
    const checker = FEATURE_CHECKERS[feature];
    if (!checker) return true;
    return checker(tenant);
  };

  return navSections
    .map((section) => {
      if (!checkFeature(section.feature)) return null;

      const items = Array.isArray(section.items)
        ? section.items.filter((item) => checkFeature(item.feature))
        : section.items;

      if (Array.isArray(section.items) && (!items || items.length === 0)) {
        return null;
      }

      return {
        ...section,
        ...(Array.isArray(items) ? { items } : {}),
      };
    })
    .filter(Boolean);
}

// ----------------------------------------------------------------------

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

function filterNavByPermissions(navSections, user) {
  if (!navSections || !user) return navSections;

  return navSections
    .map((section) => {
      // 1) Filter items within the section first
      const items = Array.isArray(section.items)
        ? section.items
            .map((item) => {
              // Check roles if defined
              if (item.roles && user?.role) {
                if (!item.roles.includes(user.role)) {
                  return null;
                }
              }

              // Check resource permissions
              if (item.resource) {
                if (!canUserAccessAnyAction(user, item.resource)) {
                  return null;
                }
              }

              // Check children permissions
              if (item.children) {
                const childItems = item.children
                  .map((child) => {
                    const resource = child.resource || item.resource;
                    const { action } = child;

                    if (action && resource) {
                      if (!canUserAccessAction(user, resource, action)) {
                        return null;
                      }
                    }
                    return child;
                  })
                  .filter(Boolean);

                if (childItems.length === 0) {
                  return null;
                }

                return { ...item, children: childItems };
              }

              return item;
            })
            .filter(Boolean)
        : section.items;

      // 2) If section has items but all were filtered out, hide the section
      if (Array.isArray(section.items) && (!items || items.length === 0)) {
        return null;
      }

      return {
        ...section,
        items,
      };
    })
    .filter(Boolean);
}
