import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VehicleExpenseCreateView } from 'src/sections/expense/views/vehicle-expense-create-view';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Expense | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleExpenseCreateView />
    </>
  );
}
