import { Button } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../iconify';

export function DialogSelectButton({
  onClick,
  disabled,
  startIcon: customStartIcon,
  placeholder,
  selected,
  selectedPrefix,
  error,
  sx,
  iconName,
  iconNameSelected,
}) {
  const defaultIconName = iconNameSelected || iconName;

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: 56,
        justifyContent: 'flex-start',
        typography: 'body2',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: selected ? 'text.primary' : 'text.disabled',
        borderColor: (theme) =>
          error
            ? theme.vars.palette.error.main
            : disabled
              ? theme.vars.palette.action.disabledBackground
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
        ...sx,
      }}
      startIcon={
        customStartIcon || (
          <Iconify
            icon={selected ? defaultIconName : `${iconName}-outline`}
            sx={{ color: selected ? 'primary.main' : 'text.disabled' }}
          />
        )
      }
    >
      {selected ? (
        <>
          {selectedPrefix && `${selectedPrefix} `}
          {selected}
        </>
      ) : (
        placeholder
      )}
    </Button>
  );
}
