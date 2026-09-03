import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';
import { useMaterialOptions } from 'src/hooks/use-material-options';

import {
  useGetTargets,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
} from 'src/query/use-customer-target';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { KanbanCustomerDialog } from 'src/sections/kanban/components/kanban-customer-dialog';

// ----------------------------------------------------------------------

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Helper function to get progress color
const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'success';
  if (percentage >= 75) return 'primary';
  if (percentage >= 50) return 'warning';
  return 'error';
};

// Helper function to get status label
const getStatusLabel = (percentage) => {
  if (percentage >= 100) return 'Completed';
  if (percentage >= 75) return 'On Track';
  if (percentage >= 50) return 'In Progress';
  return 'Behind';
};

export function LoadingTargetWidget({ sx, ...other }) {

  const [selectedDate, setSelectedDate] = useState(new Date());

  const dialog = useBoolean();
  const customerDialog = useBoolean();
  const confirmDelete = useBoolean();

  const [editingTarget, setEditingTarget] = useState(null);
  const [targetToDelete, setTargetToDelete] = useState(null);

  const [formData, setFormData] = useState({
    customer: null,
    material: '',
    targetWeight: '',
  });

  const { data: targets = [], isLoading } = useGetTargets(
    selectedDate.toISOString(),
    selectedDate.getFullYear()
  );

  const createTarget = useCreateTarget();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  const materialOptions = useMaterialOptions();

  const handleMonthChange = (event) => {
    const newMonth = MONTHS.indexOf(event.target.value);
    const newDate = new Date(selectedDate);
    newDate.setMonth(newMonth);
    setSelectedDate(newDate);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newYear);
    setSelectedDate(newDate);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleOpenCreate = () => {
    setEditingTarget(null);
    setFormData({ customer: null, material: '', targetWeight: '' });
    dialog.onTrue();
  };

  const handleOpenEdit = (target) => {
    setEditingTarget(target);
    setFormData({
      customer: target.customer,
      material: target.materialTarget.material,
      targetWeight: target.materialTarget.targetWeight.toString(),
    });
    dialog.onTrue();
  };

  const handleSubmit = async () => {
    if (!formData.material || !formData.targetWeight) return;

    const targetData = {
      customer: formData.customer?._id || null,
      materialTarget: {
        material: formData.material,
        targetWeight: Number(formData.targetWeight),
      },
      month: selectedDate,
      year: selectedDate.getFullYear(),
    };

    if (editingTarget) {
      updateTarget(
        { id: editingTarget._id, ...targetData },
        {
          onSuccess: () => {
            dialog.onFalse();
            setEditingTarget(null);
            setFormData({ customer: null, material: '', targetWeight: '' });
          },
        }
      );
    } else {
      createTarget(targetData, {
        onSuccess: () => {
          dialog.onFalse();
          setFormData({ customer: null, material: '', targetWeight: '' });
        },
      });
    }
  };

  const handleDeleteClick = (target) => {
    setTargetToDelete(target);
    confirmDelete.onTrue();
  };

  const handleConfirmDelete = () => {
    if (targetToDelete) {
      deleteTarget(targetToDelete._id);
      setTargetToDelete(null);
      confirmDelete.onFalse();
    }
  };

  const renderLoading = (
    <Stack spacing={2} sx={{ p: 3 }}>
      {[1, 2, 3].map((item) => (
        <Stack key={item} spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
            <Skeleton variant="text" width={80} height={24} />
          </Stack>
          <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
        </Stack>
      ))}
    </Stack>
  );

  const renderTargetCard = (target) => {
    const percentage = (target.achievedWeight / target.materialTarget.targetWeight) * 100;
    const progressColor = getProgressColor(percentage);
    const statusLabel = getStatusLabel(percentage);
    const isCompleted = percentage >= 100;

    return (
      <Box
        key={target._id}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.grey[500], 0.12)}`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Stack spacing={1.5}>
          {/* Header with customer info and actions */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 600, color: !target.customer ? 'primary.main' : 'inherit' }}
                >
                  {target.customer?.customerName || 'All Customers'}
                </Typography>
                <Chip
                  size="small"
                  label={statusLabel}
                  color={progressColor}
                  variant={isCompleted ? 'filled' : 'soft'}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <Iconify icon="mdi:cube-outline" width={14} />
                {target.materialTarget.material}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit Target">
                <IconButton
                  size="small"
                  onClick={() => handleOpenEdit(target)}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Target">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(target)}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Progress Section */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 0.75 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                <Box component="span" sx={{ color: `${progressColor}.main`, fontWeight: 700 }}>
                  {target.achievedWeight.toLocaleString()}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {' / '}
                  {target.materialTarget.targetWeight.toLocaleString()} Ton
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: `${progressColor}.main`,
                }}
              >
                {percentage.toFixed(1)}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              color={progressColor}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  ...(isCompleted && {
                    background: (theme) =>
                      `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  }),
                },
              }}
            />
          </Box>

          {/* Remaining/Excess indicator */}
          {percentage < 100 ? (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Iconify icon="mdi:target" width={14} />
              {(target.materialTarget.targetWeight - target.achievedWeight).toLocaleString()} Ton
              remaining
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 600,
              }}
            >
              <Iconify icon="mdi:check-circle" width={14} />
              Target achieved! +
              {(target.achievedWeight - target.materialTarget.targetWeight).toLocaleString()} Ton
              extra
            </Typography>
          )}
        </Stack>
      </Box>
    );
  };

  const renderList = (
    <Scrollbar sx={{ maxHeight: 400 }}>
      {isLoading ? (
        renderLoading
      ) : targets.length === 0 ? (
        <EmptyContent
          title="No targets set"
          description={`Set your first target for ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
          sx={{ py: 5 }}
          action={
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
              sx={{ mt: 2 }}
            >
              Set Target
            </Button>
          }
        />
      ) : (
        <Stack spacing={2} sx={{ p: 2 }}>
          {targets.map((target) => renderTargetCard(target))}
        </Stack>
      )}
    </Scrollbar>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      {/* Responsive header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Title + Subheader */}
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:target" width={24} color="primary.main" />
            <Typography variant="h6" noWrap>
              Monthly Loading Targets
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }} noWrap>
            {`Track your loading progress for ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
          </Typography>
        </Box>

        {/* Controls */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexShrink: 0, flexWrap: 'wrap', gap: 1 }}
        >
          <Select
            value={MONTHS[selectedDate.getMonth()]}
            onChange={handleMonthChange}
            size="small"
            sx={{
              minWidth: 110,
              '& .MuiSelect-select': { py: 0.75 },
            }}
          >
            {MONTHS.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={selectedDate.getFullYear()}
            onChange={handleYearChange}
            size="small"
            sx={{
              minWidth: 80,
              '& .MuiSelect-select': { py: 0.75 },
            }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>

          <Tooltip title="Add new target">
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
              sx={{
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Set Target
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {renderList}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.value} onClose={dialog.onFalse} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon={editingTarget ? 'solar:pen-bold' : 'mingcute:add-line'}
              width={24}
              color="primary.main"
            />
            <span>{editingTarget ? 'Edit Target' : 'Set Monthly Target'}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Customer (Optional - Leave blank for all)"
              value={formData.customer?.customerName || 'All Customers'}
              onClick={customerDialog.onTrue}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {formData.customer && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, customer: null });
                        }}
                      >
                        <Iconify icon="eva:close-fill" width={18} />
                      </IconButton>
                    )}
                    <Iconify icon="eva:chevron-right-fill" sx={{ color: 'text.disabled' }} />
                  </Stack>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': { cursor: 'pointer' },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Material</InputLabel>
              <Select
                value={formData.material}
                label="Material"
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 250 },
                  },
                }}
              >
                {materialOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Target Weight (Ton)"
              type="number"
              value={formData.targetWeight}
              onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
              InputProps={{
                endAdornment: (
                  <Typography variant="body2" color="text.secondary">
                    Ton
                  </Typography>
                ),
              }}
            />

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                border: (theme) => `1px dashed ${alpha(theme.palette.info.main, 0.24)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Iconify icon="mdi:calendar" width={16} />
                For {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={dialog.onFalse} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.material || !formData.targetWeight}
            startIcon={<Iconify icon={editingTarget ? 'mdi:check' : 'mingcute:add-line'} />}
          >
            {editingTarget ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={() => {
          setTargetToDelete(null);
          confirmDelete.onFalse();
        }}
        title="Delete Target"
        content={
          targetToDelete ? (
            <>
              Are you sure you want to delete the target for{' '}
              <strong>{targetToDelete.customer?.customerName || 'All Customers'}</strong> -{' '}
              <strong>{targetToDelete.materialTarget?.material}</strong>?
            </>
          ) : (
            'Are you sure you want to delete this target?'
          )
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />

      <KanbanCustomerDialog
        open={customerDialog.value}
        onClose={customerDialog.onFalse}
        onCustomerChange={(customer) => setFormData({ ...formData, customer })}
      />
    </Card>
  );
}
