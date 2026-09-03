import { useSortable } from '@dnd-kit/sortable';
import { useState, useEffect, useCallback } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { useDeleteTask, useUpdateTask } from 'src/query/use-task';

import { imageClasses } from 'src/components/image';

import ItemBase from './item-base';
import { KanbanDetails } from '../details/kanban-details';

// ----------------------------------------------------------------------

export function KanbanTaskItem({ task, disabled, columnId, sx }) {
  const openDetails = useBoolean();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { setNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id: task?._id,
  });

  const mounted = useMountStatus();

  const mountedWhileDragging = isDragging && !mounted;

  const handleDeleteTask = useCallback(async () => {
    try {
      deleteTask(task._id);
    } catch (error) {
      console.error(error);
    }
  }, [deleteTask, task]);

  const handleUpdateTask = useCallback(
    async (taskData) => {
      try {
        updateTask({ column: columnId, task: taskData });
      } catch (error) {
        console.error(error);
      }
    },
    [columnId, updateTask]
  );

  return (
    <>
      <ItemBase
        ref={disabled ? undefined : setNodeRef}
        task={task}
        onClick={openDetails.onTrue}
        stateProps={{
          transform,
          listeners,
          transition,
          sorting: isSorting,
          dragging: isDragging,
          fadeIn: mountedWhileDragging,
        }}
        sx={{ ...(openDetails.value && { [`& .${imageClasses.root}`]: { opacity: 0.8 } }), ...sx }}
      />

      <KanbanDetails
        task={task}
        openDetails={openDetails.value}
        onCloseDetails={openDetails.onFalse}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
