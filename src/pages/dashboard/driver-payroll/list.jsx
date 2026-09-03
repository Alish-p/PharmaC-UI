import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { useDriverPayrolls } from 'src/query/use-driver-payroll';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { DriverPayrollListView } from 'src/sections/driver-payroll/views';

// ----------------------------------------------------------------------

const metadata = { title: `DriverPayroll list | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { data: driversPayrolls, isLoading, isError } = useDriverPayrolls();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <EmptyContent
        filled
        title="Error Fetching Driver's Payroll !"
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverPayrollListView driversPayrolls={driversPayrolls} />
    </>
  );
}
