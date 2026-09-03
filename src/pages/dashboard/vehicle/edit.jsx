import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useVehicle } from 'src/query/use-vehicle';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { VehicleEditView } from 'src/sections/vehicle/views';

// ----------------------------------------------------------------------

const metadata = { title: `Vehicle edit | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data: vehicle, isLoading: vehicleLoading, isError: vehicleError } = useVehicle(id);

  if (vehicleLoading) {
    return <LoadingScreen />;
  }

  if (vehicleError) {
    return <EmptyContent />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VehicleEditView vehicle={vehicle} />
    </>
  );
}
