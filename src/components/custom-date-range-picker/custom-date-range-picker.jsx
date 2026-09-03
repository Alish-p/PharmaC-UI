import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export function CustomDateRangePicker({
  open,
  error,
  endDate,
  onClose,
  startDate,
  onChangeEndDate,
  variant = 'input',
  onChangeStartDate,
  onApplyRange,
  title = 'Select date range',
  presets,
}) {
  const mdUp = useResponsive('up', 'md');

  const [activePreset, setActivePreset] = useState(null);

  const handlePresetClick = useCallback(
    (preset) => {
      const [start, end] = preset.getValue();
      // Use the atomic setter to avoid the stale error-closure bug
      // that causes only one date to apply when calling the two handlers separately.
      if (onApplyRange) {
        onApplyRange(
          dayjs(start).startOf('day'),
          dayjs(end).endOf('day')
        );
      } else {
        onChangeStartDate(dayjs(start).startOf('day'));
        onChangeEndDate(dayjs(end).endOf('day'));
      }
      setActivePreset(preset.label);
    },
    [onApplyRange, onChangeStartDate, onChangeEndDate]
  );

  const handleStartChange = (date) => {
    const newDate = date ? dayjs(date).startOf('day') : null;
    onChangeStartDate(newDate);
    setActivePreset(null);
  };

  const handleEndChange = (date) => {
    const newDate = date ? dayjs(date).endOf('day') : null;
    onChangeEndDate(newDate);
    setActivePreset(null);
  };

  const isCalendarView = variant === 'calendar';
  const hasPresets = Array.isArray(presets) && presets.length > 0;

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { ...(isCalendarView && { maxWidth: 720 }) } }}
    >
      <DialogTitle sx={{ pb: hasPresets ? 1 : 2 }}>{title}</DialogTitle>

      {hasPresets && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: 3,
            pb: 2,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              size="small"
              onClick={() => handlePresetClick(preset)}
              variant={activePreset === preset.label ? 'filled' : 'outlined'}
              color={activePreset === preset.label ? 'primary' : 'default'}
              sx={{ flexShrink: 0, cursor: 'pointer' }}
            />
          ))}
        </Stack>
      )}

      <DialogContent sx={{ ...(isCalendarView && mdUp && { overflow: 'unset' }) }}>
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <DateCalendar value={startDate} onChange={handleStartChange} />
              </Paper>

              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <DateCalendar value={endDate} onChange={handleEndChange} />
              </Paper>
            </>
          ) : (
            <>
              <DatePicker label="Start date" value={startDate} onChange={handleStartChange} />

              <DatePicker label="End date" value={endDate} onChange={handleEndChange} />
            </>
          )}
        </Stack>

        {error && (
          <FormHelperText error sx={{ px: 2 }}>
            End date must be later than start date
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button disabled={error} variant="contained" onClick={onClose}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
