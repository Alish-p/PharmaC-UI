import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ExpenseListView } from 'src/sections/expense/views';
// ----------------------------------------------------------------------

const metadata = { title: `Expense list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ExpenseListView />
    </>
  );
}
