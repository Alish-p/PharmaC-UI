import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

import { ACTIONS, PERMISSIONS } from './config';

// ----------------------------------------------------------------------

const PERMISSION_OPTIONS = PERMISSIONS.flatMap((perm) =>
  ACTIONS.map((action) => ({
    label: `${perm.subheader} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    value: `${perm.name}.${action}`,
  }))
);

export function UserTableFiltersResult({ filters, onFilters, onResetFilters, totalResults, sx }) {
  const handleRemoveName = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveDesignation = useCallback(() => {
    onFilters('designation', '');
  }, [onFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={onResetFilters} sx={sx}>
      <FiltersBlock label="Name:" isShow={!!filters.name}>
        <Chip {...chipProps} label={filters.name} onDelete={handleRemoveName} />
      </FiltersBlock>

      <FiltersBlock label="Designation:" isShow={!!filters.designation}>
        <Chip {...chipProps} label={filters.designation} onDelete={handleRemoveDesignation} />
      </FiltersBlock>

      <FiltersBlock label="Permission:" isShow={!!filters.permission?.length}>
        {(filters.permission || []).map((perm) => {
          const option = PERMISSION_OPTIONS.find((opt) => opt.value === perm);
          const displayLabel = option ? option.label : perm;
          return (
            <Chip
              {...chipProps}
              key={perm}
              label={displayLabel}
              onDelete={() => {
                onFilters(
                  'permission',
                  filters.permission.filter((p) => p !== perm)
                );
              }}
            />
          );
        })}
      </FiltersBlock>
    </FiltersResult>
  );
}
