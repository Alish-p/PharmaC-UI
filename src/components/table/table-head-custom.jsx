import { CSS } from '@dnd-kit/utilities';
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

function DraggableHeaderCell({ headCell, order, orderBy, onSort, isDraggable }) {
  const isActions = headCell.id === 'actions' || headCell.id === '';
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: headCell.id,
    disabled: !isDraggable || isActions,
  });

  const dragProps = isDraggable && !isActions ? { ...attributes, ...listeners } : {};

  return (
    <TableCell
      ref={setNodeRef}
      align={headCell.align || 'left'}
      sortDirection={orderBy === headCell.id ? order : false}
      sx={{
        width: headCell.width,
        minWidth: headCell.minWidth,
        transition,
        transform: CSS.Translate.toString(transform),
        // Visual affordance for draggable header cells
        cursor: isDraggable && !isActions ? 'grab' : 'default',
        userSelect: isDraggable && !isActions ? 'none' : 'auto',
        '&:active': {
          cursor: isDraggable && !isActions ? 'grabbing' : 'default',
        },
        // Keep pointer cursor on sortable label text
        '& .MuiTableSortLabel-root': {
          cursor: onSort ? 'pointer' : 'inherit',
        },
      }}
      title={isDraggable && !isActions ? 'Drag to reorder columns' : undefined}
      {...dragProps}
    >
      {onSort && headCell.sortable === true ? (
        <TableSortLabel
          hideSortIcon
          active={orderBy === headCell.id}
          direction={orderBy === headCell.id ? order : 'asc'}
          onClick={() => onSort(headCell.id)}
          sx={(theme) => ({
            textTransform: 'capitalize',
            ...(orderBy === headCell.id && {
              color: `${theme.palette.primary.main} !important`,
              fontWeight: 'fontWeightBold',
            }),
            '& .MuiTableSortLabel-icon': {
              opacity: 1,
              color:
                orderBy === headCell.id
                  ? `${theme.palette.primary.main} !important`
                  : 'text.disabled',
            },
          })}
        >
          {headCell.tooltip ? (
            <Tooltip title={headCell.tooltip} arrow>
              <span>{headCell.label}</span>
            </Tooltip>
          ) : (
            headCell.label
          )}

          {orderBy === headCell.id ? (
            <Box sx={{ ...visuallyHidden }}>
              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
            </Box>
          ) : null}
        </TableSortLabel>
      ) : headCell.tooltip ? (
        <Tooltip title={headCell.tooltip} arrow>
          <span>{headCell.label}</span>
        </Tooltip>
      ) : (
        headCell.label
      )}
    </TableCell>
  );
}

export function TableHeadCustom({
  sx,
  order,
  onSort,
  orderBy,
  headLabel,
  rowCount = 0,
  numSelected = 0,
  onSelectAllRows,
  onOrderChange,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (onOrderChange) {
      onOrderChange(active.id, over.id);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={headLabel.map((c) => c.id).filter((id) => id !== 'actions' && id !== '')}
        strategy={horizontalListSortingStrategy}
      >
        <TableHead sx={sx}>
          <TableRow>
            {onSelectAllRows && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={!!numSelected && numSelected < rowCount}
                  checked={!!rowCount && numSelected === rowCount}
                  onChange={(event) => onSelectAllRows(event.target.checked)}
                  inputProps={{
                    name: 'select-all-rows',
                    'aria-label': 'select all rows',
                  }}
                />
              </TableCell>
            )}

            {headLabel.map((headCell) => (
              <DraggableHeaderCell
                key={headCell.id}
                headCell={headCell}
                order={order}
                orderBy={orderBy}
                onSort={onSort}
                isDraggable={!!onOrderChange}
              />
            ))}
          </TableRow>
        </TableHead>
      </SortableContext>
    </DndContext>
  );
}
