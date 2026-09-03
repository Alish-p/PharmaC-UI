import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { useAddSubtask, useToggleSubtask, useDeleteSubtask } from 'src/query/use-task';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { DATE_RANGE_PRESETS, useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { DEPARTMENTS } from '../config';
import { KanbanDetailsToolbar } from './kanban-details-toolbar';
import { KanbanInputName } from '../components/kanban-input-name';
import { KanbanDetailsPriority } from './kanban-details-priority';
import { KanbanDetailsAttachments } from './kanban-details-attachments';
import { KanbanDriverDialog } from '../components/kanban-driver-dialog';
import { KanbanDetailsCommentList } from './kanban-details-comment-list';
import { KanbanVehicleDialog } from '../components/kanban-vehicle-dialog';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

export function KanbanDetails({ task, openDetails, onUpdateTask, onDeleteTask, onCloseDetails }) {
  const tabs = useTabs('overview');

  const [priority, setPriority] = useState(task.priority);

  const [taskName, setTaskName] = useState(task.name);

  const contacts = useBoolean();

  const [taskDescription, setTaskDescription] = useState(task.description);

  const rangePicker = useDateRangePicker(dayjs(task.due[0]), dayjs(task.due[1]));

  const [formChanged, setFormChanged] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState(task?.departments || []);

  const [location, setLocation] = useState(task?.location || '');

  const [selectedAssignees, setSelectedAssignees] = useState(task?.assignees || []);

  const [selectedDriver, setSelectedDriver] = useState(task?.driver || null);
  const driverDialog = useBoolean();

  const [selectedVehicle, setSelectedVehicle] = useState(task?.vehicle || null);
  const vehicleDialog = useBoolean();

  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = useAddSubtask();
  const toggleSubtask = useToggleSubtask();
  const deleteSubtask = useDeleteSubtask();

  const handleChangeTaskName = useCallback((event) => {
    setTaskName(event.target.value);
    setFormChanged(true);
  }, []);

  const handleUpdateTask = useCallback(
    (event) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({ ...task, name: taskName });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangeTaskDescription = useCallback((event) => {
    setTaskDescription(event.target.value);
    setFormChanged(true);
  }, []);

  const handleChangePriority = useCallback((newValue) => {
    setPriority(newValue);
    setFormChanged(true);
  }, []);

  const handleLabelChange = (event) => {
    setSelectedDepartments(event.target.value);
    setFormChanged(true);
  };

  const handleLocationChange = useCallback((event) => {
    setLocation(event.target.value);
    setFormChanged(true);
  }, []);

  const handleAssigneeChange = useCallback((newAssignees) => {
    setSelectedAssignees(newAssignees);
    setFormChanged(true);
  }, []);

  const handleDriverChange = useCallback((driver) => {
    setSelectedDriver(driver);
    setFormChanged(true);
  }, []);

  const handleVehicleChange = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
    setFormChanged(true);
  }, []);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    await addSubtask({
      taskId: task._id,
      subtask: { text: newSubtask.trim() },
    });
    setNewSubtask('');
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      await toggleSubtask({
        taskId: task._id,
        subtaskId,
      });
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await deleteSubtask({
        taskId: task._id,
        subtaskId,
      });
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const handleSave = () => {
    onUpdateTask({
      ...task,
      name: taskName,
      description: taskDescription,
      priority,
      departments: selectedDepartments,
      due: [rangePicker.startDate, rangePicker.endDate],
      location,
      assignees: selectedAssignees,
      driver: selectedDriver,
      vehicle: selectedVehicle,
    });
    setFormChanged(false);
  };

  const handleCancel = () => {
    setTaskName(task.name);
    setTaskDescription(task.description);
    setPriority(task.priority);
    setSelectedDepartments(task?.departments || []);
    setLocation(task?.location || '');
    setSelectedAssignees(task?.assignees || []);
    setSelectedDriver(task?.driver || null);
    setSelectedVehicle(task?.vehicle || null);
    setFormChanged(false);
  };

  const renderToolbar = (
    <KanbanDetailsToolbar
      task={task}
      onDelete={onDeleteTask}
      onUpdate={onUpdateTask}
      onCloseDetails={onCloseDetails}
    />
  );

  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {[
        { value: 'overview', label: 'Overview' },
        { value: 'subTasks', label: 'Subtasks' },
        { value: 'activities', label: `Activities (${task?.activities?.length})` },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabOverview = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Task name */}
      <KanbanInputName
        placeholder="Task name"
        value={taskName}
        onChange={handleChangeTaskName}
        onKeyUp={handleUpdateTask}
        inputProps={{ id: `input-task-${taskName}` }}
      />

      {/* Reporter */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Reporter</StyledLabel>
        <Tooltip title={task.reporter.name}>
          <Avatar alt={task.reporter.name} src={task.reporter.avatarUrl} />
        </Tooltip>
      </Box>

      {/* Modified Assignee section */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

        <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
          {selectedAssignees.map((user) => (
            <Tooltip title={user.name}>
              <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
            </Tooltip>
          ))}

          <Tooltip title="Add assignees">
            <IconButton
              onClick={contacts.onTrue}
              sx={{
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>

          <KanbanContactsDialog
            assignees={selectedAssignees}
            open={contacts.value}
            onClose={contacts.onFalse}
            onAssigneeChange={handleAssigneeChange}
          />
        </Box>
      </Box>

      {/* Add Driver selection after Location field */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Driver</StyledLabel>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedDriver && (
            <Tooltip title={selectedDriver.driverName}>
              <Avatar alt={selectedDriver.driverName} src={task.reporter.avatarUrl} />
            </Tooltip>
          )}

          <Tooltip title={selectedDriver ? 'Change Driver' : 'Assign Driver'}>
            <IconButton
              onClick={driverDialog.onTrue}
              sx={{
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Iconify icon={selectedDriver ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Tooltip>

          <KanbanDriverDialog
            selectedDriver={selectedDriver}
            open={driverDialog.value}
            onClose={driverDialog.onFalse}
            onDriverChange={handleDriverChange}
          />
        </Box>
      </Box>

      {/* Modified Departments section */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Departments</StyledLabel>

         <Select
          multiple
          size="small"
          value={selectedDepartments}
          onChange={handleLabelChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const colors = {
                  sales: 'primary',
                  marketing: 'secondary',
                  dispatch: 'info',
                  warehouse: 'success',
                };
                const dept = DEPARTMENTS.find((d) => d.id === value);
                return (
                  <Label key={value} variant="soft" color={colors[value] || 'default'}>
                    {dept ? dept.name : value}
                  </Label>
                );
              })}
            </Box>
          )}
          sx={{ minWidth: 200 }}
        >
          {DEPARTMENTS.map(({ id, name }) => {
            const colors = {
              sales: 'primary',
              marketing: 'secondary',
              dispatch: 'info',
              warehouse: 'success',
            };
            return (
              <MenuItem key={id} value={id}>
                <Label variant="soft" color={colors[id] || 'default'}>
                  {name}
                </Label>
              </MenuItem>
            );
          })}
        </Select>
      </Box>

      {/* After Departments section, add Location field */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Location</StyledLabel>
        <TextField
          size="small"
          value={location}
          onChange={handleLocationChange}
          placeholder="Enter location"
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Add Vehicle selection after Driver field */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Vehicle</StyledLabel>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedVehicle ? (
            <Typography variant="body2">{selectedVehicle.vehicleNo}</Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.success' }}>
              No vehicle assigned
            </Typography>
          )}

          <Button
            size="small"
            startIcon={<Iconify icon={selectedVehicle ? 'eva:edit-fill' : 'mingcute:add-line'} />}
            onClick={vehicleDialog.onTrue}
          >
            {selectedVehicle ? 'Change' : 'Assign'}
          </Button>

          <KanbanVehicleDialog
            selectedVehicle={selectedVehicle}
            open={vehicleDialog.value}
            onClose={vehicleDialog.onFalse}
            onVehicleChange={handleVehicleChange}
          />
        </Box>
      </Box>

      {/* Due date */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel> Due date </StyledLabel>

        {rangePicker.selected ? (
          <Button size="small" onClick={rangePicker.onOpen}>
            {rangePicker.shortLabel}
          </Button>
        ) : (
          <Tooltip title="Add due date">
            <IconButton
              onClick={rangePicker.onOpen}
              sx={{
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        )}

        <CustomDateRangePicker
          variant="calendar"
          title="Choose due date"
          presets={DATE_RANGE_PRESETS}
          startDate={rangePicker.startDate}
          endDate={rangePicker.endDate}
          onChangeStartDate={rangePicker.onChangeStartDate}
          onChangeEndDate={rangePicker.onChangeEndDate}
          onApplyRange={rangePicker.onApplyRange}
          open={rangePicker.open}
          onClose={rangePicker.onClose}
          selected={rangePicker.selected}
          error={rangePicker.error}
        />
      </Box>

      {/* Priority */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Priority</StyledLabel>
        <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
      </Box>

      {/* Description */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel> Description </StyledLabel>
        <TextField
          fullWidth
          multiline
          size="small"
          minRows={4}
          value={taskDescription}
          onChange={handleChangeTaskDescription}
          InputProps={{ sx: { typography: 'body2' } }}
        />
      </Box>

      {/* Attachments */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel>Attachments</StyledLabel>
        <KanbanDetailsAttachments attachments={task.attachments} />
      </Box>

      {/* Add Save/Cancel buttons at the bottom */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formChanged}
          startIcon={<Iconify icon="material-symbols:save" />}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={!formChanged}
          startIcon={<Iconify icon="material-symbols:cancel-outline" />}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );

  const renderTabSubtasks = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <div>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {task.subtasks?.filter((subtask) => subtask.completed)?.length || 0} of{' '}
          {task.subtasks?.length || 0}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={
            ((task.subtasks?.filter((subtask) => subtask.completed)?.length || 0) /
              (task.subtasks?.length || 1)) *
            100
          }
        />
      </div>

      <FormGroup>
        {task.subtasks?.map((subtask) => (
          <Box
            key={subtask._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  disableRipple
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask._id)}
                />
              }
              label={subtask.text}
            />
            <IconButton size="small" color="error" onClick={() => handleDeleteSubtask(subtask._id)}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
        ))}
      </FormGroup>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add a subtask..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddSubtask();
            }
          }}
        />
        <Button variant="contained" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
          Add
        </Button>
      </Box>
    </Box>
  );

  const renderTabComments = (
    <>{!!task?.activities?.length && <KanbanDetailsCommentList activities={task?.activities} />}</>
  );

  return (
    <Drawer
      open={openDetails}
      onClose={onCloseDetails}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
    >
      {renderToolbar}

      {renderTabs}

      <Scrollbar fillContent sx={{ py: 3, px: 2.5 }}>
        {tabs.value === 'overview' && renderTabOverview}
        {tabs.value === 'subTasks' && renderTabSubtasks}
        {tabs.value === 'activities' && renderTabComments}
      </Scrollbar>

      {tabs.value === 'activities' && <KanbanDetailsCommentInput taskId={task._id} />}
    </Drawer>
  );
}
