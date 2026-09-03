import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import TenantAdminCreateView from 'src/sections/tenant-admin/tenant-admin-create-view';

const metadata = { title: `New Tenant | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <TenantAdminCreateView />
    </>
  );
}
