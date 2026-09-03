import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { useGps } from 'src/query/use-gps';
import { CONFIG } from 'src/config-global';

import { MapWithMarker } from 'src/components/map';
import { EmptyContent } from 'src/components/empty-content';

export function VehicleLocationMap({ vehicleNo, isOwn }) {
  const { data, isLoading } = useGps(vehicleNo, { enabled: !!vehicleNo && isOwn });
  const lat = data?.latitude;
  const lng = data?.longitude;

  return (
    <Card>
      <CardHeader title="Vehicle Location" subheader={data?.address ? data?.address : ''} />
      <Box sx={{ height: 400, p: 2 }}>
        {lat && lng ? (
          <MapWithMarker lat={lat} lng={lng} zoom={12} />
        ) : (
          <EmptyContent
            filled
            title={isLoading ? 'Fetching current location…' : 'Location unavailable'}
            description={
              isLoading
                ? 'Hang tight while we grab the vehicle position.'
                : 'We couldn’t find recent GPS data for this vehicle.'
            }
            imgUrl={`${CONFIG.site.basePath}/assets/illustrations/illustration-dashboard.webp`}
            sx={{
              height: 1,
              py: 6,
              borderRadius: 1,
            }}
            slotProps={{
              title: { color: 'text.secondary' },
              description: { color: 'text.disabled' },
              img: { maxWidth: 200, opacity: 0.9 },
            }}
          />
        )}
      </Box>
    </Card>
  );
}
