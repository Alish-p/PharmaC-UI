import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, Alert, Divider, Tooltip, CardHeader, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import MapWithRoute from 'src/components/map/map-with-route';

// --------------- hook ---------------

function usePincodesCoordinates(pincode1, pincode2) {
  return useQuery({
    queryKey: ['nominatim', pincode1, pincode2],
    queryFn: async () => {
      const fetchCoords = async (pincode) => {
        if (!pincode) return null;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`
        );
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
      };

      const [coords1, coords2] = await Promise.all([fetchCoords(pincode1), fetchCoords(pincode2)]);
      return { consignorCoords: coords1, consigneeCoords: coords2 };
    },
    enabled: Boolean(pincode1 || pincode2),
    staleTime: Infinity,
  });
}

// --------------- address row ---------------

function AddressRow({ color, label, title, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
          mt: 0.3,
        }}
      >
        {label}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {children}
        </Typography>
      </Box>
    </Stack>
  );
}

// --------------- component ---------------

export function SubtripRouteMapWidget({ payload }) {
  const consignorPincode = payload?.pincode_of_consignor;
  const consigneePincode = payload?.pincode_of_consignee;

  const { data, isLoading } = usePincodesCoordinates(consignorPincode, consigneePincode);

  const from = data?.consignorCoords;
  const to = data?.consigneeCoords;

  const originPopup = (
    <>
      <strong>A — Origin</strong>
      <br />
      {payload?.place_of_consignor && `${payload.place_of_consignor}, `}
      {payload?.actual_from_state_name || payload?.state_of_consignor}
    </>
  );

  const destPopup = (
    <>
      <strong>B — Destination</strong>
      <br />
      {payload?.place_of_consignee && `${payload.place_of_consignee}, `}
      {payload?.actual_to_state_name || payload?.state_of_supply}
    </>
  );

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:map-marker-distance" width={22} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1">Route Map</Typography>
            <Tooltip title="This data has been displayed from e-way bill" placement="top">
              <Box
                component="span"
                sx={{ display: 'inline-flex', color: 'text.secondary', cursor: 'pointer' }}
              >
                <Iconify icon="eva:info-outline" width={16} />
              </Box>
            </Tooltip>
          </Stack>
        }
        subheader={
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            <Stack spacing={1.5} sx={{ mb: 1 }}>
              <AddressRow color="#16a34a" label="A" title="Origin">
                {payload?.legal_name_of_consignor && (
                  <strong>
                    {payload.legal_name_of_consignor}
                    <br />
                  </strong>
                )}
                {[payload?.address1_of_consignor, payload?.address2_of_consignor]
                  .filter(Boolean)
                  .join(', ')}
                {[payload?.address1_of_consignor, payload?.address2_of_consignor].filter(Boolean)
                  .length > 0 && <br />}
                {payload?.place_of_consignor && `${payload.place_of_consignor}, `}
                {payload?.actual_from_state_name || payload?.state_of_consignor} -{' '}
                {payload?.pincode_of_consignor}
              </AddressRow>

              <AddressRow color="#dc2626" label="B" title="Destination">
                {payload?.legal_name_of_consignee && (
                  <strong>
                    {payload.legal_name_of_consignee}
                    <br />
                  </strong>
                )}
                {[payload?.address1_of_consignee, payload?.address2_of_consignee]
                  .filter(Boolean)
                  .join(', ')}
                {[payload?.address1_of_consignee, payload?.address2_of_consignee].filter(Boolean)
                  .length > 0 && <br />}
                {payload?.place_of_consignee && `${payload.place_of_consignee}, `}
                {payload?.actual_to_state_name || payload?.state_of_supply} -{' '}
                {payload?.pincode_of_consignee}
              </AddressRow>
            </Stack>

            <Stack direction="row" spacing={3}>
              {payload?.transportation_distance ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:road-variant" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {payload.transportation_distance} KM
                  </Typography>
                </Stack>
              ) : null}
              {payload?.number_of_valid_days ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:clock-outline" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Takes less than {payload.number_of_valid_days} Days
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </Stack>
        }
      />

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, height: 360 }}>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading map...
          </Typography>
        ) : (!consignorPincode && !consigneePincode) || (!from && !to) ? (
          <Alert severity="error" variant="outlined">
            cant find location on map
          </Alert>
        ) : (
          <Box
            sx={{
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <MapWithRoute from={from} to={to} fromLabel={originPopup} toLabel={destPopup} />
          </Box>
        )}
      </Box>
    </Card>
  );
}
