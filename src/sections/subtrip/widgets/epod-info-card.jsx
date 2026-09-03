import { Box, Card, Link, Stack, Divider, CardHeader, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import MapWithMarker from 'src/components/map/map-with-marker';

// ----------------------------------------------------------------------

export function EpodInfoCard({ subtrip: st }) {
  if (!st.podSignature) return null;

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:signature-freehand" width={22} sx={{ color: 'success.main' }} />
            <Typography variant="subtitle1">Electronic Proof of Delivery</Typography>
          </Stack>
        }
      />
      <Divider />
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box
          component="img"
          src={st.podSignature}
          alt="e-Signature"
          sx={{
            maxWidth: 300,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: '#fff',
          }}
        />
        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Signed by:</strong> {st.podSignedBy}
          </Typography>
          {st.podSigneeMobile && (
            <Typography variant="body2">
              <strong>Mobile Number:</strong> {st.podSigneeMobile}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Signed at:</strong> {new Date(st.podSignedAt).toLocaleString()}
          </Typography>
          {st.podRemarks && (
            <Typography variant="body2">
              <strong>Remarks:</strong> {st.podRemarks}
            </Typography>
          )}
          {st.podGeoLocation?.latitude && (
            <>
              <Typography variant="body2">
                <strong>Location:</strong>
              </Typography>
              <Box
                sx={{
                  height: 200,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  mt: 1,
                }}
              >
                <MapWithMarker
                  lat={st.podGeoLocation.latitude}
                  lng={st.podGeoLocation.longitude}
                  zoom={15}
                />
              </Box>
            </>
          )}
          {st.podImages && st.podImages.length > 0 && (
            <Stack spacing={0.5} mt={1}>
              <Typography variant="body2">
                <strong>Evidence Images:</strong>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {st.podImages.map((imgUrl, index) => (
                  <Link
                    key={index}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    underline="always"
                  >
                    evidence-{index + 1}
                  </Link>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
