// @mui

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function LRInfoCard({ subtrip }) {
  const {
    customerId = {},
    ewayBill,
    ewayExpiryDate,
    loadingPoint,
    unloadingPoint,
    materialType,
    quantity,
    grade,
    tripId = {},
    vehicleId,
    driverId,
    startDate,
    endDate,
    loadingWeight = '-',
    unloadingWeight = '-',
    shortageWeight = '-',
    shortageAmount = '-',
    invoiceNo = '-',
    orderNo = '-',
    shipmentNo = '-',
    diNumber = '-',
    consignee = '-',
    referenceSubtripNo = '-',
    vehicleAssignment,
    freightDetails,
    commissionDetails,
  } = subtrip;

  const rate = freightDetails?.rate ?? '-';
  const commissionRate = commissionDetails?.commissionRate ?? '-';

  const customerName = customerId?.customerName || '-';
  const customerId_ = customerId?._id;
  const tripNo = tripId?.tripNo || '-';
  const vehicleNo = vehicleId?.vehicleNo || '-';
  const vehicleId_ = vehicleId?._id;
  const driverName = driverId?.driverName || '-';
  const driverId_ = driverId?._id;

  const renderCustomer = (
    <>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:information-outline" width={24} />
            <Typography variant="h6">Subtrip Info</Typography>
          </Stack>
        }
      />
      <Stack direction="row" sx={{ p: 3 }}>
        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2', width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
            <Iconify icon="mdi:account" width={20} />
            {customerId_ ? (
              <Link
                component={RouterLink}
                href={paths.dashboard.customer.details(customerId_)}
                variant="subtitle2"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                {customerName}
              </Link>
            ) : (
              <Typography variant="subtitle2">{customerName}</Typography>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:identifier" width={20} />
            <Typography>
              Trip No:{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {tripNo}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:calendar-start" width={20} />
            <Typography>
              Start:{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {fDateTime(startDate)}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:calendar-end" width={20} />
            <Typography>
              End:{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {endDate ? fDateTime(endDate) : '-'}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:account-tie" width={20} />
            <Typography>
              Consignee:{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {consignee}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:truck-outline" width={20} />
            <Typography>
              Vehicle:{' '}
              {vehicleId_ ? (
                <Link
                  component={RouterLink}
                  href={paths.dashboard.vehicle.details(vehicleId_)}
                  color="primary"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  {vehicleNo}
                </Link>
              ) : (
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {vehicleNo}
                </Box>
              )}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="healthicons:truck-driver" width={20} />
            <Typography>
              Driver:{' '}
              {driverId_ ? (
                <Link
                  component={RouterLink}
                  href={paths.dashboard.driver.details(driverId_)}
                  color="primary"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  {driverName}
                </Link>
              ) : (
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {driverName}
                </Box>
              )}
            </Typography>
          </Stack>

          {vehicleAssignment && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:truck-check-outline" width={20} />
              <Typography>
                Assignment:{' '}
                <Box component="span" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                  {vehicleAssignment === 'schedule' ? 'Schedule Vehicle' : 'Adhock Vehicle'}
                </Box>
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );

  const renderRoute = (
    <>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:routes" width={24} />
            <Typography variant="h6">Route</Typography>
          </Stack>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:map-marker" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Loading Point
          </Box>
          <Typography>{loadingPoint}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:map-marker-check" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Unloading Point
          </Box>
          <Typography>{unloadingPoint}</Typography>
        </Stack>

        {/* Start/End KM removed from UI */}
      </Stack>
    </>
  );

  const renderMaterial = (
    <>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:package-variant" width={24} />
            <Typography variant="h6">Material</Typography>
          </Stack>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:cube" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Material
          </Box>
          <Typography>{materialType}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:star" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Grade
          </Box>
          <Typography>{grade}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:scale" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Quantity
          </Box>
          <Typography>{quantity}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:currency-inr" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Rate
          </Box>
          <Typography>
            {rate}
            {rate !== '-' && <span>&nbsp;₹</span>}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:cash-check" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Commission Rate
          </Box>
          <Typography>
            {commissionRate}
            {commissionRate !== '-' && <span>&nbsp;₹</span>}
          </Typography>
        </Stack>
      </Stack>
    </>
  );

  const renderDocs = (
    <>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:file-document" width={24} />
            <Typography variant="h6">Documents</Typography>
          </Stack>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:link-variant" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Reference Job No
          </Box>
          <Typography>{referenceSubtripNo}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:truck-delivery" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Shipment
          </Box>
          <Typography>{shipmentNo}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:file-document-outline" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Invoice
          </Box>
          <Typography>{invoiceNo}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:numeric" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Order No
          </Box>
          <Typography>{orderNo}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:ticket" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            DI No
          </Box>
          <Typography>{diNumber}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:barcode" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Eway-Bill
          </Box>
          <Typography>{ewayBill}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:calendar" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Eway-Bill Expiry
          </Box>
          <Typography>{fDateTime(ewayExpiryDate)}</Typography>
        </Stack>
      </Stack>
    </>
  );

  const renderWeight = (
    <>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:weight" width={24} />
            <Typography variant="h6">Weight</Typography>
          </Stack>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:weight-kilogram" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Loading Weight
          </Box>
          <Typography>{loadingWeight}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:weight-kilogram" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Unloading Weight
          </Box>
          <Typography>{unloadingWeight}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:scale-unbalanced" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Shortage Weight
          </Box>
          <Typography>{shortageWeight}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:currency-inr" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Shortage Amount
          </Box>
          <Typography>{shortageAmount}</Typography>
        </Stack>
      </Stack>
    </>
  );

  return (
    <Card sx={{ boxShadow: 2 }}>
      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderRoute}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderMaterial}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDocs}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderWeight}
    </Card>
  );
}
