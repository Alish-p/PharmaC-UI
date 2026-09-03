import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useVehicleDocument } from 'src/query/use-documents';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { VehicleDocumentEditView } from 'src/sections/vehicle/documents/views';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Vehicle Document | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: doc, isLoading, isError } = useVehicleDocument(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !doc) {
    return (
      <EmptyContent
        filled
        title="Document not found!"
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleDocumentEditView doc={doc} />
    </>
  );
}
