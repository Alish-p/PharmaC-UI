import * as React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListSubheader from '@mui/material/ListSubheader';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function ColumnSelectorList({
  open,
  onClose,
  TABLE_COLUMNS,
  visibleColumns,
  disabledColumns,
  onResetColumns,
  canResetColumns,
  handleToggleColumn,
  handleToggleAllColumns,
}) {
  // Group columns alphabetically
  const groupedColumns = TABLE_COLUMNS.reduce((acc, column) => {
    const letter = column.label[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(column);
    return acc;
  }, {});

  // Determine switch state for Select All
  const selectableColumns = TABLE_COLUMNS.filter((col) => !disabledColumns[col.id]);
  const allSelected = selectableColumns.every((col) => visibleColumns[col.id]);
  // const someSelected = selectableColumns.some((col) => visibleColumns[col.id]);

  const handleSelectAllToggle = () => {
    const newState = !allSelected;
    handleToggleAllColumns(newState);
  };

  // Search state for filtering columns
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter columns based on searchTerm
  const filteredGroupedColumns = React.useMemo(() => {
    if (!searchTerm) return groupedColumns;
    return Object.keys(groupedColumns).reduce((acc, letter) => {
      const filtered = groupedColumns[letter].filter((col) =>
        col.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length) acc[letter] = filtered;
      return acc;
    }, {});
  }, [groupedColumns, searchTerm]);
  const filteredKeys = Object.keys(filteredGroupedColumns).sort();

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const selectedCount = Object.values(visibleColumns).filter(Boolean).length;
  const totalCount = TABLE_COLUMNS.length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:table-column" width={24} sx={{ color: 'text.secondary' }} />
            <Typography variant="h6">Columns</Typography>
          </Stack>

          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <Iconify icon="eva:close-circle-fill" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      {/* Select All / Reset Row */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.neutral',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Switch
            size="small"
            checked={allSelected}
            onChange={handleSelectAllToggle}
            inputProps={{ 'aria-label': 'Toggle all columns' }}
          />
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {allSelected ? 'Hide All' : 'Show All'}
          </Typography>
        </Stack>

        <Button
          size="small"
          color="error"
          variant="soft"
          startIcon={
            <Badge
              color="error"
              variant="dot"
              invisible={!canResetColumns}
              sx={{
                '& .MuiBadge-badge': {
                  top: 2,
                  right: 2,
                },
              }}
            >
              <Iconify icon="solar:restart-bold" width={16} />
            </Badge>
          }
          onClick={onResetColumns}
          sx={{ px: 1.5 }}
        >
          Reset
        </Button>
      </Box>

      <Divider />

      {/* Column count indicator */}
      <Box sx={{ px: 2.5, py: 1, bgcolor: 'background.paper' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Showing {selectedCount} of {totalCount} columns
        </Typography>
      </Box>

      <Scrollbar sx={{ flexGrow: 1 }}>
        <List disablePadding sx={{ pb: 3 }}>
          {/* Alphabetically Grouped Columns */}
          {filteredKeys.map((letter) => (
            <React.Fragment key={letter}>
              <ListSubheader
                disableSticky
                sx={{
                  typography: 'overline',
                  color: 'text.disabled',
                  bgcolor: 'transparent',
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                  lineHeight: 'unset',
                }}
              >
                {letter}
              </ListSubheader>

              {filteredGroupedColumns[letter].map((column) => {
                const isDisabled = disabledColumns[column.id];
                const isVisible = visibleColumns[column.id];

                return (
                  <Box
                    key={column.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1,
                      cursor: isDisabled ? 'default' : 'pointer',
                      '&:hover': {
                        bgcolor: isDisabled ? 'transparent' : 'action.hover',
                      },
                      opacity: isDisabled ? 0.6 : 1,
                    }}
                    onClick={() => !isDisabled && handleToggleColumn(column.id)}
                    component={isDisabled ? Tooltip : 'div'}
                    {...(isDisabled && {
                      title: 'This column is locked and cannot be hidden',
                      placement: 'left',
                      arrow: true,
                    })}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {isDisabled ? (
                        <Iconify icon="mdi:lock" width={18} sx={{ color: 'text.disabled' }} />
                      ) : (
                        <Box sx={{ width: 18 }} /> // Spacer for alignment
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isVisible ? 500 : 400,
                          color: isDisabled ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {column.label}
                      </Typography>
                    </Stack>

                    <Switch
                      size="small"
                      checked={isVisible}
                      disabled={isDisabled}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => !isDisabled && handleToggleColumn(column.id)}
                      inputProps={{ 'aria-label': `Toggle ${column.label}` }}
                    />
                  </Box>
                );
              })}
            </React.Fragment>
          ))}

          {filteredKeys.length === 0 && (
            <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No columns found
              </Typography>
            </Box>
          )}
        </List>
      </Scrollbar>
    </Drawer>
  );
}
