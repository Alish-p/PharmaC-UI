import Alert from '@mui/material/Alert';

import { CurrentTyreLayoutView } from './current-tyre-layout-view';
import { VehicleTyreLayoutSelect } from './vehicle-tyre-layout-select';

// ----------------------------------------------------------------------

export function VehicleTyreLayoutView({ vehicle }) {
  if (!vehicle?.isOwn) {
    return (
      <Alert severity="info" sx={{ m: 3 }}>
        Tyre management is only for own vehicle
      </Alert>
    );
  }

  if (vehicle?.tyreLayoutId) {
    return <CurrentTyreLayoutView vehicle={vehicle} />;
  }

  return <VehicleTyreLayoutSelect vehicle={vehicle} />;
}
