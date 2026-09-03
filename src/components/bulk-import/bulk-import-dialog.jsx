import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

import { BulkImportView } from './bulk-import-view';

// ----------------------------------------------------------------------

export function BulkImportDialog({ open, onClose, entityName, schema, columns, onImport }) {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
        <DialogActions
          sx={{
            p: 1.5,
          }}
        >
          <Button color="inherit" variant="contained" onClick={onClose}>
            Close
          </Button>
        </DialogActions>

        <Box sx={{ flexGrow: 1, height: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          <BulkImportView
            entityName={entityName}
            schema={schema}
            columns={columns}
            onImport={onImport}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
