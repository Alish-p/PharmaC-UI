import { createContext } from 'react';

export const TenantContext = createContext(undefined);

export const TenantConsumer = TenantContext.Consumer;
