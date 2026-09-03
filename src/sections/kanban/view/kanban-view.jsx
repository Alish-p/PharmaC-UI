import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  rectIntersection,
  getFirstCollision,
  MeasuringStrategy,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useUsers } from 'src/query/use-user';
import { useReorderTasks } from 'src/query/use-task';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { kanbanClasses } from '../classes';
import { coordinateGetter } from '../utils';
import { COLUMNS, DEPARTMENTS } from '../config';
import { KanbanColumn } from '../column/kanban-column';
import { KanbanTaskItem } from '../item/kanban-task-item';
import { KanbanDragOverlay } from '../components/kanban-drag-overlay';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';

// ----------------------------------------------------------------------

const cssVars = {
  '--item-gap': '24px',
  '--item-radius': '12px',
  '--column-gap': '72px',
  '--column-width': '450px',
  '--column-radius': '16px',
  '--column-padding': '20px 16px 16px 16px',
};

// ----------------------------------------------------------------------

export function KanbanView({ tasks }) {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [openContacts, setOpenContacts] = useState(false);
  const [localTasks, setLocalTasks] = useState(tasks);
  const reorderTasks = useReorderTasks();
  const { data: users = [] } = useUsers();

  const selectedUser = useMemo(() => {
    if (assigneeFilter === 'all') return null;
    return users.find((u) => u._id === assigneeFilter) || null;
  }, [users, assigneeFilter]);

  const handleAssigneeChange = useCallback((newAssignees) => {
    const contact = newAssignees[0];
    setAssigneeFilter(contact ? contact._id : 'all');
    setOpenContacts(false);
  }, []);

  const recentlyMovedToNewContainer = useRef(false);

  const lastOverId = useRef(null);

  const [activeId, setActiveId] = useState(null);
  const startColumnId = useRef(null);

  const columnIds = COLUMNS.map((column) => column.id);

  const isSortingContainer = activeId ? columnIds.includes(activeId) : false;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter })
  );

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeId && activeId in localTasks) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((column) => column.id in localTasks),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);

      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId in localTasks) {
          const columnItems = localTasks[overId].map((task) => task._id);

          // If a column is matched and it contains items (columns 'A', 'B', 'C')
          if (columnItems.length > 0) {
            // Return the closest droppable within that column
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (column) => column.id !== overId && columnItems.includes(column.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new column, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new column, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, localTasks]
  );

  const findColumn = (id) => {
    // if the id is column id, return the id
    if (id in localTasks) {
      return id;
    }

    // if the id is task id, return the column id
    return Object.keys(localTasks).find((key) =>
      localTasks[key].map((task) => task._id).includes(id)
    );
  };

  // keep localTasks in sync with upstream tasks
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, []);

  /**
   * onDragStart
   */
  const onDragStart = ({ active }) => {
    setActiveId(active.id);
    // remember the column where the drag started so we can compare on drop
    startColumnId.current = findColumn(active.id);
  };

  /**
   * onDragOver
   */
  const onDragOver = ({ active, over }) => {
    const overId = over?.id;

    if (overId == null) {
      return;
    }

    const overColumn = findColumn(overId);

    const activeColumn = findColumn(active.id);

    // if the over and active column
    if (!overColumn || !activeColumn) {
      return;
    }

    // if the active column is not the same as the over column, then move the task visually
    // this only updates localTasks for smooth drag feedback, no API call here
    if (activeColumn !== overColumn) {
      const activeItems = localTasks[activeColumn].map((task) => task._id);
      const overItems = localTasks[overColumn].map((task) => task._id);
      const overIndex = overItems.indexOf(overId);
      const activeIndex = activeItems.indexOf(active.id);

      let newIndex;

      if (overId in tasks) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      recentlyMovedToNewContainer.current = true;

      const updated = {
        ...localTasks,
        [activeColumn]: localTasks[activeColumn].filter((task) => task._id !== active.id),
        [overColumn]: [
          ...localTasks[overColumn].slice(0, newIndex),
          localTasks[activeColumn][activeIndex],
          ...localTasks[overColumn].slice(newIndex, localTasks[overColumn].length),
        ],
      };

      setLocalTasks(updated);
    }
  };

  /**
   * onDragEnd
   */
  const onDragEnd = ({ active, over }) => {
    const activeColumn = findColumn(active.id);

    if (!activeColumn) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    const overColumn = findColumn(overId);

    // Determine if we moved to a different column or reordered within same
    if (activeColumn && overColumn) {
      const activeItems = localTasks[activeColumn];
      const overItems = localTasks[overColumn];

      const activeIndex = activeItems.findIndex((t) => t._id === active.id);
      const overIndex = overItems.findIndex((t) => t._id === overId);

      let newLocalTasks = { ...localTasks };

      // Case 1: Reordering in same column
      if (activeColumn === overColumn) {
        if (activeIndex !== overIndex) {
          const reorderedItems = arrayMove(activeItems, activeIndex, overIndex);
          newLocalTasks = {
            ...localTasks,
            [activeColumn]: reorderedItems,
          };
          setLocalTasks(newLocalTasks);
        }
      } else {
        // Case 2: Moved to different column (handled visually in dragOver, but we confirm here)
        // If we trust localTasks state from dragOver, we just need to ensure we persist
      }

      // Prepare updates for backend
      // We need to send updates for BOTH source and dest columns if different
      // Or just the one column if same.
      // Easiest is to recalculate order for all tasks in the affected column(s)
      const updates = [];
      const columnsToUpdate =
        activeColumn === overColumn ? [activeColumn] : [activeColumn, overColumn];

      columnsToUpdate.forEach((colId) => {
        newLocalTasks[colId].forEach((task, index) => {
          updates.push({
            _id: task._id,
            status: colId,
            order: index, // New order based on array position
          });
        });
      });

      // Call API
      reorderTasks(updates);
    }

    startColumnId.current = null;
    setActiveId(null);
  };

  // Optimization: Memoize the filtered tasks per column
  const filteredColumns = useMemo(() => {
    const filters = {
      priority: priorityFilter,
      assignee: assigneeFilter,
      department: departmentFilter,
    };

    const result = {};

    COLUMNS.forEach((column) => {
      const rawTasks = localTasks[column.id] || [];
      result[column.id] = rawTasks.filter((task) => {
        const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
        const assigneeMatch =
          filters.assignee === 'all' || task.assignees.some(({ _id }) => _id === filters.assignee);
        const departmentMatch =
          filters.department === 'all' || (task.departments || []).includes(filters.department);
        return priorityMatch && assigneeMatch && departmentMatch;
      });
    });

    return result;
  }, [localTasks, priorityFilter, assigneeFilter, departmentFilter]);

  const renderList = (
    <DndContext
      id="dnd-kanban"
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <Stack sx={{ flex: '1 1 auto', overflowX: 'auto' }}>
        <Stack
          sx={{
            pb: 3,
            display: 'unset',
            ...{ minHeight: 0, display: 'flex', flex: '1 1 auto' },
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 'var(--column-gap)',
              ...{
                minHeight: 0,
                flex: '1 1 auto',
                [`& .${kanbanClasses.columnList}`]: { flex: '1 1 auto' },
              },
            }}
          >
            <Stack direction="row" sx={{ gap: 'var(--column-gap)' }}>
              {COLUMNS.map((column) => (
                <KanbanColumn key={column.id} column={column} tasks={filteredColumns[column.id]}>
                  <SortableContext
                    items={filteredColumns[column.id].map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredColumns[column.id].map((task) => (
                      <KanbanTaskItem
                        task={task}
                        key={task._id}
                        columnId={column.id}
                        disabled={isSortingContainer}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <KanbanDragOverlay columns={COLUMNS} tasks={localTasks} activeId={activeId} sx={cssVars} />
    </DndContext>
  );
  const renderFilters = () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="kanban-priority-filter-label">Priority</InputLabel>
        <Select
          labelId="kanban-priority-filter-label"
          value={priorityFilter === 'all' ? '' : priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value || 'all')}
          input={<OutlinedInput label="Priority" />}
          MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
        >
          <MenuItem value="">All</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <MenuItem value="low">
            <Label variant="soft" color="info">
              Low
            </Label>
          </MenuItem>
          <MenuItem value="medium">
            <Label variant="soft" color="warning">
              Medium
            </Label>
          </MenuItem>
          <MenuItem value="high">
            <Label variant="soft" color="error">
              High
            </Label>
          </MenuItem>
        </Select>
      </FormControl>

      <DialogSelectButton
        onClick={() => setOpenContacts(true)}
        selected={selectedUser?.name}
        placeholder="Assignee"
        iconName={APP_ICONS.user}
        sx={{ minWidth: 140, maxWidth: 200, height: 40 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="kanban-department-filter-label">Department</InputLabel>
        <Select
          labelId="kanban-department-filter-label"
          value={departmentFilter === 'all' ? '' : departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value || 'all')}
          input={<OutlinedInput label="Department" />}
          MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
        >
          <MenuItem value="">All</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {DEPARTMENTS.map((dept) => {
            const colors = {
              sales: 'primary',
              marketing: 'secondary',
              dispatch: 'info',
              warehouse: 'success',
            };
            return (
              <MenuItem key={dept.id} value={dept.id}>
                <Label variant="soft" color={colors[dept.id] || 'default'}>
                  {dept.name}
                </Label>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        ...cssVars,
        pb: 0,
        pl: { sm: 3 },
        pr: { sm: 0 },
        flex: '1 1 0',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pr: { sm: 3 }, mb: { xs: 3, md: 5 } }}
      >
        <Typography variant="h4">Issue Board</Typography>
        {renderFilters()}
      </Stack>

      <>{renderList}</>

      <KanbanContactsDialog
        assignees={selectedUser ? [selectedUser] : []}
        open={openContacts}
        onClose={() => setOpenContacts(false)}
        onAssigneeChange={handleAssigneeChange}
        single
      />
    </DashboardContent>
  );
}
