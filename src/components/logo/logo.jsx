import { useId, forwardRef } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ width = 40, height = 40, disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const theme = useTheme();

    const gradientId = useId();

    const PRIMARY_LIGHT = theme.vars.palette.primary.light;

    const PRIMARY_MAIN = theme.vars.palette.primary.main;

    const PRIMARY_DARK = theme.vars.palette.primary.dark;

    /*
     * OR using local (public folder)
     * const logo = ( <Box alt="logo" component="img" src={`${CONFIG.site.basePath}/logo/logo-single.svg`} width={width} height={height} /> );
     */

    const logo = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 512 512"
        aria-labelledby={`${gradientId}-title`}
        role="img"
      >
        <title id={`${gradientId}-title`}>PharmaC Logo</title>
        <defs>
          <linearGradient id={`${gradientId}-1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient id={`${gradientId}-2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_MAIN} />
            <stop offset="100%" stopColor={PRIMARY_DARK} />
          </linearGradient>
        </defs>
        <g fillRule="evenodd">
          {/* Rounded background shield/badge */}
          <rect x="48" y="48" width="416" height="416" rx="96" fill={`url(#${gradientId}-1)`} opacity="0.15" />
          {/* Pharmacy cross horizontal bar */}
          <rect x="112" y="208" width="288" height="96" rx="32" fill={`url(#${gradientId}-2)`} />
          {/* Pharmacy cross vertical bar */}
          <rect x="208" y="112" width="96" height="288" rx="32" fill={`url(#${gradientId}-1)`} />
          {/* Center heart/dot highlight */}
          <circle cx="256" cy="256" r="28" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>
    );

    return (
      <NoSsr
        fallback={
          <Box
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              ...sx,
            }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          width={width}
          height={height}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {logo}
        </Box>
      </NoSsr>
    );
  }
);
