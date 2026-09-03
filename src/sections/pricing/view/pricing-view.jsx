import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { _pricingPlans } from 'src/_mock';

import { PricingCard } from '../pricing-card';

// ----------------------------------------------------------------------

export function PricingView() {
  return (
    <Container sx={{ pt: 5, pb: 10 }}>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        Simple, transparent pricing
        <br /> for Indian transporters
      </Typography>

      <Typography align="center" sx={{ color: 'text.secondary', mb: 8 }}>
        Per vehicle charges — choose a plan that fits your fleet size and needs. No hidden fees.
      </Typography>

      <Box
        gap={{ xs: 3, md: 0 }}
        display="grid"
        alignItems={{ md: 'center' }}
        gridTemplateColumns={{ md: 'repeat(3, 1fr)' }}
      >
        {_pricingPlans.map((card) => (
          <PricingCard key={card.subscription} card={card} />
        ))}
      </Box>
    </Container>
  );
}
