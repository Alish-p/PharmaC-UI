import { useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { ACTIONS, PERMISSIONS } from './config';

// ----------------------------------------------------------------------

const PERMISSION_OPTIONS = PERMISSIONS.flatMap((perm) =>
  ACTIONS.map((action) => ({
    label: `${perm.subheader} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    value: `${perm.name}.${action}`,
    group: perm.subheader,
  }))
);

export function UserTableToolbar({ filters, onFilters }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDesignation = useCallback(
    (event) => {
      onFilters('designation', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          value={filters.designation}
          onChange={handleFilterDesignation}
          placeholder="Designation"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Autocomplete
          multiple
          limitTags={2}
          options={PERMISSION_OPTIONS}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          value={PERMISSION_OPTIONS.filter((option) =>
            (filters.permission || []).includes(option.value)
          )}
          onChange={(event, newValue) => {
            onFilters(
              'permission',
              newValue.map((option) => option.value)
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Permission"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start" sx={{ pl: 0.75 }}>
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.value}
                label={option.label}
                size="small"
                variant="soft"
              />
            ))
          }
          sx={{ width: 1 }}
        />
      </Stack>
    </Stack>
  );
}
