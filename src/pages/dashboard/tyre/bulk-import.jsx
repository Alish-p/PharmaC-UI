import { Helmet } from 'react-helmet-async';

import { TyreBulkImportView } from 'src/sections/tyre/view/tyre-bulk-import-view';

// ----------------------------------------------------------------------

export default function TyreBulkImportPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Tyre Import</title>
      </Helmet>

      <TyreBulkImportView />
    </>
  );
}
