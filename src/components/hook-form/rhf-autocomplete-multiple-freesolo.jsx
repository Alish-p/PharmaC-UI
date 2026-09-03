import { Controller, useFormContext } from 'react-hook-form';

import { TextField, Autocomplete } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

export function RHFMultiAutocompleteFreeSolo({
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
          multiple
          freeSolo
          selectOnFocus
          clearOnBlur={false}
          handleHomeEndKeys
          onChange={(event, newValue) => {
            const formatted = newValue.map((item) => {
              if (typeof item === 'string') {
                return { label: item, value: item };
              }
              if (item && item.inputValue) {
                return { label: item.inputValue, value: item.inputValue };
              }
              return item;
            });
            field.onChange(formatted);
          }}
          filterOptions={(optionsList, params) => {
            const filtered = filter(optionsList, params);
            const { inputValue } = params;
            const isExisting = optionsList.some((option) => option.label === inputValue);
            if (inputValue !== '' && !isExisting) {
              filtered.push({ inputValue, label: inputValue, value: inputValue });
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
            return option.value === value.value;
          }}
          options={options}
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
