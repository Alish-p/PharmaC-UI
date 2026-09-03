import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DriverPayrollCreateView } from 'src/sections/driver-payroll/views';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new Driver Payroll | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DriverPayrollCreateView />
    </>
  );
}
