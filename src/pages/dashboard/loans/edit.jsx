import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useLoan } from 'src/query/use-loan';
import { useDrivers } from 'src/query/use-driver';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { LoanEditView } from 'src/sections/loans/views';

// ----------------------------------------------------------------------

const metadata = { title: `Loan edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: loan, isLoading: loanLoading, isError: loanError } = useLoan(id);
  const { data: drivers, isLoading: driversLoading, isError: driversError } = useDrivers();

  if (loanLoading || driversLoading) {
    return <LoadingScreen />;
  }

  if (loanError || driversError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LoanEditView loan={loan} driverList={drivers} />
    </>
  );
}
