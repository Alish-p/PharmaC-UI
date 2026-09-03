import { useNavigate } from 'react-router-dom';

import { Link, TableRow, TableCell } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';
import { paramCase } from 'src/utils/change-case';

import { Label } from 'src/components/label';

import { SUBTRIP_STATUS_COLORS } from 'src/sections/subtrip/constants';

import { subtripConfig } from './basic-subtrip-table-config';

// ----------------------------------------------------------------------

export default function SubtripListRow({ row, index }) {
  const navigate = useNavigate();

  return (
    <TableRow>
      {subtripConfig.map((column) => (
        <TableCell key={column.id} align="start">
          {(() => {
            switch (column.id) {
              case 'index':
                return index;
              case '_id':
                return (
                  <Link
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      navigate(paths.dashboard.subtrip.details(paramCase(row._id)));
                    }}
                  >
                    {row.subtripNo}
                  </Link>
                );
              case 'customerId':
                return row?.customerId?.customerName ?? '-';
              case 'routeName':
                return row?.loadingPoint && row?.unloadingPoint
                  ? `${row.loadingPoint} → ${row.unloadingPoint}`
                  : '-';
              case 'invoiceNo':
                return row.invoiceNo;
              case 'startDate':
                return fDate(row[column.id]);
              case 'subtripStatus':
                return (
                  <Label
                    variant="soft"
                    color={SUBTRIP_STATUS_COLORS[row[column.id]?.toLowerCase()] || 'default'}
                  >
                    {row[column.id]}
                  </Label>
                );

              default:
                return row[column.id];
            }
          })()}
        </TableCell>
      ))}
    </TableRow>
  );
}
