import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFTextField({ name, helperText, placeholder, type, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          InputLabelProps={type === 'number' ? { shrink: true } : undefined}
          placeholder={type === 'number' && !placeholder ? '0' : placeholder}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          onWheel={type === 'number' ? (e) => e.target.blur() : undefined}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputProps={{
            autoComplete: 'off',
          }}
          {...other}
        />
      )}
    />
  );
}
