import { Helmet } from 'react-helmet-async';

import TransporterAdvanceListView from 'src/sections/transporter-advance/views/transporter-advance-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Transporter Advances List</title>
      </Helmet>

      <TransporterAdvanceListView />
    </>
  );
}
