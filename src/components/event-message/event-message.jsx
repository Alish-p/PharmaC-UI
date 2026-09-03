import Markdown from 'react-markdown';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------
// EventMessage
//
// Renders a backend-compiled Markdown `displayMessage` string.
// Internal /dashboard/... links use the SPA RouterLink to avoid full
// page reloads. All other links open in a new tab.
// ----------------------------------------------------------------------

const components = {
  // Intercept <a> tags produced by react-markdown
  a({ href, children }) {
    const isInternal = href?.startsWith('/');
    if (isInternal) {
      return (
        <Link component={RouterLink} href={href} color="primary" underline="hover">
          {children}
        </Link>
      );
    }
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">
        {children}
      </Link>
    );
  },

  // Render **bold** as a MUI Typography span so it inherits theme styles
  strong({ children }) {
    return (
      <Typography component="span" variant="inherit" fontWeight="fontWeightSemiBold">
        {children}
      </Typography>
    );
  },

  // Strip the default <p> wrapper so the message stays inline
  p({ children }) {
    return <span>{children}</span>;
  },
};

// ----------------------------------------------------------------------

export function EventMessage({ message }) {
  if (!message) return null;

  return (
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
        '& a': { verticalAlign: 'baseline' },
      }}
    >
      <Markdown components={components}>{message}</Markdown>
    </Typography>
  );
}
