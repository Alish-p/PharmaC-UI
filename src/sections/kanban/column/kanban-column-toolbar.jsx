import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function KanbanColumnToolBar({ columnName, totalTasks, onToggleAddTask }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Label
        sx={{
          borderRadius: '50%',
          borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
        }}
      >
        {totalTasks}
      </Label>

      <p>{columnName}</p>
      {onToggleAddTask ? (
        <IconButton size="small" color="inherit" onClick={onToggleAddTask}>
          <Iconify icon="solar:add-circle-bold" />
        </IconButton>
      ) : (
        <Box sx={{ width: 34 }} />
      )}
    </Stack>
  );
}
