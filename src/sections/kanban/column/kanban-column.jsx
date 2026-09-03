import { useCallback } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCreateTask } from 'src/query/use-task';

import ColumnBase from './column-base';
import { KanbanTaskAdd } from '../components/kanban-task-add';
import { KanbanColumnToolBar } from './kanban-column-toolbar';

// ----------------------------------------------------------------------

export function KanbanColumn({ children, column, tasks, disabled, sx }) {
  const createTask = useCreateTask();
  const openAddTask = useBoolean();

  const { attributes, isDragging, listeners, setNodeRef, transition, active, over, transform } =
    useSortable({
      id: column.id,
      data: { type: 'container', children: tasks },
      animateLayoutChanges,
    });

  const tasksIds = tasks.map((task) => task._id);

  const isOverContainer = over
    ? (column.id === over.id && active?.data.current?.type !== 'container') ||
      tasksIds.includes(over.id)
    : false;

  const handleAddTask = useCallback(
    async (taskData) => {
      try {
        createTask({ column: column.id, task: taskData });

        openAddTask.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, createTask, openAddTask]
  );

  return (
    <ColumnBase
      ref={disabled ? undefined : setNodeRef}
      sx={{
        transition,
        transform: CSS.Translate.toString(transform),
        borderTop: `3px solid ${column.color}`,
        borderBottom: `3px solid ${column.color}`,
        '& .MuiPaper-root': {
          borderRadius: 2,
          borderColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[800],
        },
        ...sx,
      }}
      stateProps={{
        dragging: isDragging,
        hover: isOverContainer,
        handleProps: { ...attributes, ...listeners },
      }}
      slots={{
        header: (
          <KanbanColumnToolBar
            handleProps={{ ...attributes, ...listeners }}
            totalTasks={tasks.length}
            columnName={column.name}
            onToggleAddTask={column.id === 'todo' ? openAddTask.onToggle : null}
          />
        ),
        main: <>{children}</>,
        action:
          column.id === 'todo' ? (
            <KanbanTaskAdd
              status={column.name}
              openAddTask={openAddTask.value}
              onAddTask={handleAddTask}
              onCloseAddTask={openAddTask.onFalse}
            />
          ) : null,
      }}
    />
  );
}

// ----------------------------------------------------------------------

const animateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true });
