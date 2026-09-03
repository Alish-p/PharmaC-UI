import { Helmet } from 'react-helmet-async';

import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SubtripExpenseCreateView } from 'src/sections/expense/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Expense | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const searchParams = useSearchParams();

  const currentSubtrip = searchParams.get('currentSubtrip');

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SubtripExpenseCreateView currentSubtrip={currentSubtrip} />
    </>
  );
}
