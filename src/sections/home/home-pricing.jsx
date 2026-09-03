import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import { useTabs } from 'src/hooks/use-tabs';

import { _pricingPlans } from 'src/_mock';
import { varAlpha } from 'src/theme/styles';

import { MotionViewport } from 'src/components/animate';

import { PricingCard } from '../pricing/pricing-card';
import { FloatLine } from './components/svg-elements';
import { SectionTitle } from './components/section-title';

// ----------------------------------------------------------------------

export function HomePricing({ sx, ...other }) {
  const theme = useTheme();

  const tabs = useTabs('basic');

  const renderDescription = (
    <SectionTitle
      caption="plans"
      title="Transparent"
      txtGradient="pricing"
      description="Choose from flexible pricing options designed to fit your business needs and budget with no hidden fees."
      sx={{ mb: 8, textAlign: 'center' }}
    />
  );

  const renderContentDesktop = (
    <Box gridTemplateColumns="repeat(3, 1fr)" sx={{ display: { xs: 'none', md: 'grid' } }}>
      {_pricingPlans.map((plan) => (
        <PricingCard key={plan.subscription} card={plan} />
      ))}
    </Box>
  );

  const renderContentMobile = (
    <Stack spacing={5} alignItems="center" sx={{ display: { md: 'none' } }}>
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          boxShadow: `0px -2px 0px 0px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)} inset`,
        }}
      >
        {_pricingPlans.map((tab) => (
          <Tab key={tab.subscription} value={tab.subscription} label={tab.subscription} />
        ))}
      </Tabs>

      <Box
        sx={{
          width: 1,
          borderRadius: 2,
          border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      >
        {_pricingPlans.map(
          (tab) =>
            tab.subscription === tabs.value && <PricingCard key={tab.subscription} card={tab} />
        )}
      </Box>
    </Stack>
  );

  return (
    <Stack component="section" sx={{ py: 10, position: 'relative', ...sx }} {...other}>
      <MotionViewport>
        <FloatLine vertical sx={{ top: 0, left: 80 }} />

        <Container>{renderDescription}</Container>

        <Box
          sx={{
            position: 'relative',
            '&::before, &::after': {
              width: 64,
              height: 64,
              content: "''",
              [theme.breakpoints.up(1440)]: {
                display: 'block',
              },
            },
          }}
        >
          <Container>{renderContentDesktop}</Container>

          <FloatLine sx={{ top: 64, left: 0 }} />
          <FloatLine sx={{ bottom: 64, left: 0 }} />
        </Box>

        <Container>{renderContentMobile}</Container>
      </MotionViewport>
    </Stack>
  );
}
