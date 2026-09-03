import { Helmet } from 'react-helmet-async';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubtripEditForm from '../subtrip-edit-form';

export function SubtripEditView({ subtrip }) {
  return (
    <>
      <Helmet>
        <title>Job: Edit Job | Dashboard</title>
      </Helmet>

      <Container>
        <CustomBreadcrumbs
          heading="Edit Job"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Job List',
              href: paths.dashboard.subtrip.list,
            },
            { name: 'Edit Job' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <SubtripEditForm currentSubtrip={subtrip} />
      </Container>
    </>
  );
}
