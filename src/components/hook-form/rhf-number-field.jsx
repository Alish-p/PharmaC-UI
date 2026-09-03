import { useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

export function RHFNumberField({ name, label, helperText, placeholder = '', ...other }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <TextField
      fullWidth
      type="text" // text so we don’t get the native spinner
      label={label}
      placeholder={placeholder}
      error={!!errors[name]}
      helperText={errors[name]?.message ?? helperText}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        inputMode: 'decimal', // mobile keyboards will show digits + dot
        pattern: '^[0-9]*\\.?[0-9]*$', // simple client-side hint
        autoComplete: 'off',
        step: 'any',
        onWheel: (e) => e.currentTarget.blur(), // kill the wheel-changing behavior
      }}
      {...register(name, {
        valueAsNumber: true, // coerce to number
        setValueAs: (v) => {
          // if empty or invalid, make it undefined
          if (v === '' || Number.isNaN(Number(v))) return undefined;

          // strip leading zeros on pure integers
          if (!v.includes('.')) {
            return Number(v.replace(/^0+(?=\d)/, ''));
          }
          // for decimals, just cast to Number (preserves tiny decimals)
          return Number(v);
        },
        validate: (n) =>
          n === undefined ||
          (!Number.isNaN(n) && typeof n === 'number') ||
          'Must be a valid number',
      })}
      {...other}
    />
  );
}
