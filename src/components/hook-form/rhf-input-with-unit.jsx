import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

/**
 * RHFInputWithUnit
 * A React Hook Form compatible text/number input with a selectable unit in the end adornment.
 * Persists the value to `name` and the unit to `unitName` within the same form.
 */
export function RHFInputWithUnit({
  name,
  unitName,
  label,
  helperText,
  placeholder = '0',
  unitOptions = [
    { label: 'Ltr', value: 'ltr' },
    { label: 'Amount', value: 'amount' },
  ],
  defaultUnit = 'ltr',
  textFieldProps = {},
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [menuEl, setMenuEl] = useState(null);
  const unit = watch(unitName) || defaultUnit;

  const unitLabel = useMemo(
    () => unitOptions.find((u) => u.value === unit)?.label || '',
    [unit, unitOptions]
  );

  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);
  const handleSelectUnit = (val) => {
    setValue(unitName, val, { shouldValidate: true, shouldDirty: true });
    handleCloseMenu();
  };

  return (
    <>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        error={!!errors[name]}
        helperText={errors[name]?.message ?? helperText}
        type="text"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment:
            unit === 'amount' ? <InputAdornment position="start">₹</InputAdornment> : undefined,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Change unit" arrow>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={handleOpenMenu}
                  aria-haspopup="menu"
                  aria-expanded={Boolean(menuEl)}
                  aria-controls={`${name}-unit-menu`}
                  sx={{
                    minWidth: 0,
                    px: 1,
                    lineHeight: 1.5,
                    textTransform: 'none',
                    borderRadius: 1.25,
                    fontWeight: 600,
                  }}
                >
                  {unitLabel}
                  <span aria-hidden="true" style={{ paddingLeft: 4 }}>
                    ▾
                  </span>
                </Button>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        inputProps={{
          inputMode: 'decimal',
          pattern: '^[0-9]*\\.?[0-9]*$',
          autoComplete: 'off',
          onWheel: (e) => e.currentTarget.blur(),
        }}
        {...register(name, {
          valueAsNumber: true,
          setValueAs: (v) => {
            if (v === '' || Number.isNaN(Number(v))) return undefined;
            if (!v.includes('.')) return Number(v.replace(/^0+(?=\d)/, ''));
            return Number(v);
          },
          validate: (n) =>
            n === undefined ||
            (!Number.isNaN(n) && typeof n === 'number') ||
            'Must be a valid number',
        })}
        {...textFieldProps}
      />
      <Menu
        id={`${name}-unit-menu`}
        open={Boolean(menuEl)}
        anchorEl={menuEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {unitOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === unit}
            onClick={() => handleSelectUnit(opt.value)}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default RHFInputWithUnit;
