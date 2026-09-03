import { useMemo, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

// ----------------------------------------------------------------------

export function KanbanTaskAdd({ openAddTask, onAddTask, onCloseAddTask }) {
  const [taskName, setTaskName] = useState('');

  const defaultTask = useMemo(
    () => ({
      name: taskName.trim() ? taskName : 'Untitled',
      priority: 'low',
    }),
    [taskName]
  );

  const handleChangeName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleKeyUpAddTask = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onAddTask(defaultTask);
        setTaskName('');
      }
    },
    [defaultTask, onAddTask]
  );

  const handleCancel = useCallback(() => {
    setTaskName('');
    onCloseAddTask();
  }, [onCloseAddTask]);

  if (!openAddTask) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleCancel}>
      <div>
        <Paper
          sx={{
            borderRadius: 1.5,
            bgcolor: 'background.default',
            boxShadow: (theme) => theme.customShadows.z1,
          }}
        >
          <InputBase
            autoFocus
            fullWidth
            placeholder="Task Name..."
            value={taskName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpAddTask}
            sx={{
              px: 2,
              height: 56,
              [`& .${inputBaseClasses.input}`]: { p: 0, typography: 'subtitle2' },
            }}
          />
        </Paper>

        <FormHelperText sx={{ mx: 1 }}>Press Enter to create the task.</FormHelperText>
      </div>
    </ClickAwayListener>
  );
}
