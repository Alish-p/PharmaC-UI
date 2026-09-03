import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import TenantAdminListView from 'src/sections/tenant-admin/tenant-admin-list-view';

const metadata = { title: `Tenants | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <TenantAdminListView />
    </>
  );
}
