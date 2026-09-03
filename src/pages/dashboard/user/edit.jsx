import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useUser } from 'src/query/use-user';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: user, isLoading, isError } = useUser(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <EmptyContent filled title="Something went wrong!" />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserEditView user={user} />
    </>
  );
}
