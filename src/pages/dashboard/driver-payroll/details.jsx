import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { useDriverPayroll } from 'src/query/use-driver-payroll';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { DriverPayrollDetailView } from 'src/sections/driver-payroll/views';

// ----------------------------------------------------------------------

const metadata = { title: `Driver Payroll details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: driverPayroll, isLoading, isError } = useDriverPayroll(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <EmptyContent
        filled
        title="Something went wrong!"
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverPayrollDetailView driverPayroll={driverPayroll} />
    </>
  );
}
