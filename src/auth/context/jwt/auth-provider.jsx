import { useMemo, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';

import { useSetState } from 'src/hooks/use-set-state';
import { getStorage } from 'src/hooks/use-local-storage';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    tenant: null,
    accessibleTenants: [],
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = getStorage(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        const { user, tenant, accessibleTenants } = res.data;

        setState({
          user: { ...user, accessToken },
          tenant,
          accessibleTenants: accessibleTenants || [],
          loading: false,
        });
      } else {
        setState({ user: null, tenant: null, accessibleTenants: [], loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, tenant: null, accessibleTenants: [], loading: false });
    }
  }, [setState]);

  const switchTenant = useCallback(
    async (tenantId) => {
      try {
        setState({ loading: true });
        const res = await axios.post(endpoints.auth.switchTenant, { tenantId });
        const { accessToken } = res.data;

        if (accessToken) {
          await setSession(accessToken);
        }

        // Hard reload/redirect to /dashboard to clear all in-memory caches completely
        window.location.href = paths.dashboard.root;
      } catch (error) {
        console.error('Failed to switch company:', error);
        setState({ loading: false });
        throw error;
      }
    },
    [setState]
  );

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  // A helper function that checks whether the user can perform an action on a resource.
  const hasPermission = useCallback(
    (resource, action) => {
      if (!state.user || !state.user.permissions) {
        return false;
      }

      const resourcePermissions = state.user.permissions[resource];
      if (!resourcePermissions) {
        return false;
      }

      return Boolean(resourcePermissions[action]);
    },
    [state.user]
  );

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'admin',
          }
        : null,
      tenant: state.tenant,
      accessibleTenants: state.accessibleTenants || [],
      switchTenant,
      hasPermission,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, state.tenant, state.accessibleTenants, switchTenant, status, hasPermission]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
