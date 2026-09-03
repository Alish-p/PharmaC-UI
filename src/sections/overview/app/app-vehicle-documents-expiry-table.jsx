import { useState } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fToNow } from 'src/utils/format-time';

import { useExpiringDocuments } from 'src/query/use-dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

import { getStatusMeta } from 'src/sections/vehicle/utils/document-utils';

// ----------------------------------------------------------------------

export function AppVehicleDocumentsExpiryTable({ title, subheader, ...other }) {
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useExpiringDocuments();

  const expiredOrExpiringDocs = data?.results || [];

  const displayedDocs = showAll ? expiredOrExpiringDocs : expiredOrExpiringDocs.slice(0, 5);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', ...other.sx }} {...other}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify
              icon="mdi:alert-decagram"
              sx={{ color: 'error.main', mr: 1, width: 24, height: 24 }}
            />
            <Typography variant="h6">
              {title} {expiredOrExpiringDocs.length > 0 && `(${expiredOrExpiringDocs.length})`}
            </Typography>
          </Box>
        }
        subheader={subheader}
        sx={{ mb: 3 }}
      />

      <Scrollbar sx={{ flexGrow: 1, minHeight: 0 }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'vehicle', label: 'Vehicle' },
              { id: 'docType', label: 'Document Type' },
              { id: 'docNumber', label: 'Document No' },
              { id: 'expiryDate', label: 'Expiry Date' },
              { id: 'remaining', label: 'Time Left' },
              { id: 'status', label: 'Status' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : expiredOrExpiringDocs.length > 0 ? (
              displayedDocs.map((row, idx) => {
                const statusMeta = getStatusMeta(
                  row.status.charAt(0).toUpperCase() + row.status.slice(1)
                );
                const vehicleId = row.vehicle?._id || row.vehicle;
                const vehicleNo = row.vehicle?.vehicleNo || row.vehicleNo || 'N/A';
                const isExpired = row.status.toLowerCase() === 'expired';

                return (
                  <TableRow key={row._id}>
                    <TableCell>{idx + 1}</TableCell>

                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.vehicle.details(vehicleId)}
                        variant="subtitle2"
                        sx={{ color: 'primary.main' }}
                      >
                        {vehicleNo}
                      </Link>
                    </TableCell>

                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {row.docType?.replace(/_/g, ' ')}
                    </TableCell>

                    <TableCell>{row.docNumber || '-'}</TableCell>

                    <TableCell>{row.expiryDate ? fDate(row.expiryDate) : '-'}</TableCell>

                    <TableCell>
                      {row.expiryDate ? (
                        <Typography
                          variant="body2"
                          color={isExpired ? 'error.main' : 'warning.main'}
                        >
                          {fToNow(row.expiryDate)}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell>
                      <Box
                        component={isExpired ? m.div : 'div'}
                        {...(isExpired && {
                          animate: {
                            scale: [1, 1.05, 1],
                            opacity: [1, 0.8, 1],
                          },
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        })}
                      >
                        <Label
                          variant="soft"
                          color={statusMeta?.color || 'default'}
                          startIcon={<Iconify icon={statusMeta?.icon} />}
                          sx={{
                            textTransform: 'capitalize',
                            ...(isExpired && {
                              fontWeight: 'bold',
                              boxShadow: (theme) => `0 0 8px ${theme.palette.error.main}`,
                            }),
                          }}
                        >
                          {row.status}
                        </Label>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableNoData notFound title="No expired or expiring documents found." />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {expiredOrExpiringDocs.length > 5 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowAll((prev) => !prev)}
              endIcon={
                <Iconify
                  icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={18}
                  sx={{ ml: -0.5 }}
                />
              }
            >
              {showAll ? 'View less' : 'View all'}
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}
