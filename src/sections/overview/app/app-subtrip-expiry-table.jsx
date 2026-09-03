import { useState } from 'react';

import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow } from 'src/utils/format-time';

import { useSubtripsExpiry } from 'src/query/use-dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

export function SubtripExpiryTable({ title, subheader, ...other }) {
  const { data: subtrips = [], isLoading } = useSubtripsExpiry();
  const [showAll, setShowAll] = useState(false);

  const displayedSubtrips = showAll ? subtrips : subtrips.slice(0, 5);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', ...other.sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ flexGrow: 1, minHeight: 0 }}>
        <Table size="small" sx={{ minWidth: 680 }}>
          <TableHeadCustom
            headLabel={[
              { id: 'index', label: 'No.' },
              { id: 'subtripId', label: 'LR No' },
              { id: 'vehicle', label: 'Vehicle' },
              { id: 'customer', label: 'Customer' },
              { id: 'ewayExpiryDate', label: 'Eway Expiry' },
              { id: 'unloadingPoint', label: 'Unloading Point' },
              { id: 'expired', label: 'Status' },
            ]}
          />
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : subtrips.length ? (
              <>
                {displayedSubtrips.map((row, idx) => (
                  <TableRow key={row._id || row.subtripId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={paths.dashboard.subtrip.details(row._id || row.subtripId)}
                        variant="body2"
                        noWrap
                        sx={{ color: 'primary.main' }}
                      >
                        {row.subtripNo}
                      </Link>
                    </TableCell>
                    <TableCell>{row.vehicle}</TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>{fToNow(new Date(row.ewayExpiryDate))}</TableCell>
                    <TableCell>{row.unloadingPoint}</TableCell>
                    <TableCell>
                      <Label variant="soft" color={row.expired ? 'error' : 'success'}>
                        {row.expired ? 'Expired' : 'Valid'}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableNoData notFound />
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      {subtrips.length > 5 && (
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
