import { Table, TableBody, TableContainer } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import SubtripListRow from './basic-subtrip-table-row';
import { subtripConfig } from './basic-subtrip-table-config';
import { TableNoData, TableHeadCustom } from '../../components/table';

export default function SimpleSubtripList({ subtrips }) {
  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
      <Scrollbar>
        <Table size="medium">
          <TableHeadCustom headLabel={subtripConfig} />

          <TableBody>
            {subtrips.map((row, i) => (
              <SubtripListRow key={row._id} row={row} index={i + 1} />
            ))}
            <TableNoData notFound={subtrips.length === 0} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
