import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { useTenantById } from 'src/query/use-tenant-admin';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import TenantAdminDetailView from 'src/sections/tenant-admin/tenant-admin-detail-view';

const metadata = { title: `Tenant Details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();
  const { data, isLoading, isError } = useTenantById(id);
  const tenant = data?.tenant;
  const users = data?.users;
  const stats = data?.stats;

  if (isLoading) return <LoadingScreen />;
  if (isError || !tenant) return <EmptyContent />;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <TenantAdminDetailView tenant={tenant} users={users} stats={stats} />
    </>
  );
}
