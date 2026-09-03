// @mui
import { Box, Card, Stack, CardHeader } from '@mui/material';

// components
import { Iconify } from 'src/components/iconify';

export default function InsightsWidget({ insights }) {
  return (
    <Card>
      <CardHeader title="Trip Insights" subheader="Key metrics and analysis" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {insights.map((insight, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Iconify
              icon={
                insight.type.includes('underrun') || insight.type.includes('underuse')
                  ? 'mdi:information'
                  : insight.type.includes('overrun') || insight.type.includes('overuse')
                    ? 'mdi:information'
                    : 'mdi:information'
              }
              sx={{
                color: (theme) => {
                  if (insight.type.includes('underrun') || insight.type.includes('underuse')) {
                    return theme.palette.primary.main;
                  }
                  if (insight.type.includes('overrun') || insight.type.includes('overuse')) {
                    return theme.palette.error.main;
                  }
                  return theme.palette.info.main;
                },
                width: 24,
                height: 24,
                flexShrink: 0,
              }}
            />
            <Box sx={{ typography: 'body2', color: 'text.secondary' }}>{insight.message}</Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
