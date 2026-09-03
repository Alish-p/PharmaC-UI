import { Helmet } from 'react-helmet-async';

import { PartBulkImportView } from 'src/sections/part/views/part-bulk-import-view';

// ----------------------------------------------------------------------

export default function PartBulkImportPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Part Import</title>
      </Helmet>

      <PartBulkImportView />
    </>
  );
}
