/* eslint-disable react/prop-types */
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

export default function WorkOrderTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedVehicle,
  selectedPart,
  selectedCreatedBy,
  selectedClosedBy,
  selectedIssueAssignee,
  ...other
}) {
  const handleRemoveStatus = () => {
    onFilters('status', 'all');
  };

  const handleRemovePriority = () => {
    onFilters('priority', 'all');
  };

  const handleRemoveCategory = () => {
    onFilters('category', 'all');
  };

  const handleRemoveVehicle = () => {
    onFilters('vehicleId', '');
  };

  const handleRemovePart = () => {
    onFilters('partId', '');
  };

  const handleRemoveCreatedBy = () => {
    onFilters('createdBy', '');
  };

  const handleRemoveClosedBy = () => {
    onFilters('closedBy', '');
  };

  const handleRemoveIssueAssignee = () => {
    onFilters('issueAssignee', '');
  };

  const handleRemoveIssue = () => {
    onFilters('issue', '');
  };

  const handleRemoveWorkOrderNo = () => {
    onFilters('workOrderNo', '');
  };

  const handleRemoveExpenseAdded = () => {
    onFilters('expenseAdded', '');
  };

  const handleRemoveStartDate = () => {
    onFilters('startDateStart', null);
    onFilters('startDateEnd', null);
  };

  const handleRemoveEndDate = () => {
    onFilters('endDateStart', null);
    onFilters('endDateEnd', null);
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status && filters.status !== 'all' && (
          <Block label="Status :">
            <Chip size="small" label={filters.status} onDelete={handleRemoveStatus} />
          </Block>
        )}

        {filters.workOrderNo && (
          <Block label="WO No. :">
            <Chip size="small" label={filters.workOrderNo} onDelete={handleRemoveWorkOrderNo} />
          </Block>
        )}

        {filters.priority && filters.priority !== 'all' && (
          <Block label="Priority :">
            <Chip size="small" label={filters.priority} onDelete={handleRemovePriority} />
          </Block>
        )}

        {filters.category && filters.category !== 'all' && (
          <Block label="Category :">
            <Chip size="small" label={filters.category} onDelete={handleRemoveCategory} />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle :">
            <Chip
              size="small"
              label={selectedVehicle?.vehicleNo || filters.vehicleId}
              onDelete={handleRemoveVehicle}
            />
          </Block>
        )}

        {filters.partId && (
          <Block label="Part :">
            <Chip
              size="small"
              label={selectedPart?.name || filters.partId}
              onDelete={handleRemovePart}
            />
          </Block>
        )}

        {filters.createdBy && (
          <Block label="Created By :">
            <Chip
              size="small"
              label={selectedCreatedBy?.name || filters.createdBy}
              onDelete={handleRemoveCreatedBy}
            />
          </Block>
        )}

        {filters.closedBy && (
          <Block label="Closed By :">
            <Chip
              size="small"
              label={selectedClosedBy?.name || filters.closedBy}
              onDelete={handleRemoveClosedBy}
            />
          </Block>
        )}

        {filters.issueAssignee && (
          <Block label="Issue Assignee :">
            <Chip
              size="small"
              label={selectedIssueAssignee?.name || filters.issueAssignee}
              onDelete={handleRemoveIssueAssignee}
            />
          </Block>
        )}

        {filters.issue && (
          <Block label="Issue :">
            <Chip size="small" label={filters.issue} onDelete={handleRemoveIssue} />
          </Block>
        )}

        {filters.expenseAdded && (
          <Block label="Expense Status :">
            <Chip
              size="small"
              label={filters.expenseAdded === 'true' ? 'Added' : 'Not Added'}
              onDelete={handleRemoveExpenseAdded}
            />
          </Block>
        )}

        {filters.startDateStart && filters.startDateEnd && (
          <Block label="Work order start date :">
            <Chip
              size="small"
              label={fDateRangeShortLabel(filters.startDateStart, filters.startDateEnd)}
              onDelete={handleRemoveStartDate}
            />
          </Block>
        )}

        {filters.endDateStart && filters.endDateEnd && (
          <Block label="Work order end date :">
            <Chip
              size="small"
              label={fDateRangeShortLabel(filters.endDateStart, filters.endDateEnd)}
              onDelete={handleRemoveEndDate}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
