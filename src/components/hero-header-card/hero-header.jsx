import React from 'react';

import Box from '@mui/material/Box';

import { HeroHeaderCard } from './hero-header-card';

// A reusable sticky wrapper around HeroHeaderCard so pages get a consistent header
// Props:
// - offsetTop: number | responsive object (default 70)
// - padding: responsive padding for the sticky area (default { xs: 2, md: 3 })
// - wrapperSx: extra sx for the sticky Box
// - All other props are forwarded to HeroHeaderCard
export function HeroHeader({ offsetTop = 70, wrapperSx, ...cardProps }) {
  return (
    <Box
      sx={{
        // position: 'sticky',
        top: offsetTop,
        zIndex: 9,
        bgcolor: 'background.default',
        ...wrapperSx,
      }}
    >
      <HeroHeaderCard {...cardProps} />
    </Box>
  );
}

export default HeroHeader;
