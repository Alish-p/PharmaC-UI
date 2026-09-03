import { Controller, useFormContext } from 'react-hook-form';

import { TextField, Autocomplete } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

/**
 * A reusable React Hook Form compatible Autocomplete component with freeSolo mode
 * that allows users to enter arbitrary values while suggesting options from a predefined list.
 *
 * @param {string} name - The field name in the form
 * @param {string} label - The label for the input field
 * @param {Array} options - Array of options to suggest (each should have label and value properties)
 * @param {Object} other - Other props to pass to the Autocomplete component
 */
export function RHFFreeSoloAutocomplete({
  name,
  label,
  options = [],
  placeholder,
  helperText,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              field.onChange({ label: newValue, value: newValue });
            } else if (newValue && newValue.inputValue) {
              field.onChange({ label: newValue.inputValue, value: newValue.inputValue });
            } else {
              field.onChange(newValue);
            }
          }}
          onInputChange={(event, newInputValue) => {
            // Handle real-time input changes
            if (newInputValue === '') {
              field.onChange(null);
            } else {
              field.onChange({ label: newInputValue, value: newInputValue });
            }
          }}
          filterOptions={(optionsList, params) => {
            const filtered = filter(optionsList, params);

            const { inputValue } = params;
            const isExisting = optionsList.some((option) => inputValue === option.label);
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                inputValue,
                label: inputValue,
                value: inputValue,
              });
            }

            return filtered;
          }}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            if (option?.inputValue) {
              return option.inputValue;
            }
            return option?.label || '';
          }}
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            const optionValue = typeof option === 'string' ? option : option.value;
            const valueValue = typeof value === 'string' ? value : value.value;
            return optionValue === valueValue;
          }}
          options={options}
          freeSolo
          selectOnFocus
          clearOnBlur={false} // Prevent clearing on blur to maintain the typed value
          handleHomeEndKeys
          renderOption={(props, option) => <li {...props}>{option.label}</li>}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message || helperText}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
