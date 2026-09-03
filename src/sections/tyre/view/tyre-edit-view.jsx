import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { useGetTyre } from 'src/query/use-tyre';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TyreNewEditForm from '../tyre-new-edit-form';

// ----------------------------------------------------------------------

export default function TyreEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  const { data: currentTyre } = useGetTyre(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Tyre"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Tyre',
            href: paths.dashboard.tyre.root,
          },
          { name: currentTyre?.serialNumber },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TyreNewEditForm currentTyre={currentTyre} />
    </Container>
  );
}
