import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TyreNewEditForm from '../tyre-new-edit-form';

// ----------------------------------------------------------------------

export default function TyreCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new tyre"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Tyre',
            href: paths.dashboard.tyre.root,
          },
          { name: 'New tyre' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TyreNewEditForm />
    </Container>
  );
}
