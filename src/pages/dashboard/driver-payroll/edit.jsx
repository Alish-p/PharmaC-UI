import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DriverPayrollEditView } from 'src/sections/driver-payroll/views';

// ----------------------------------------------------------------------

const metadata = { title: `Driver Payroll edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverPayrollEditView />
    </>
  );
}
