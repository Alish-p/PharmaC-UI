import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

export default function TyreThreadWidget({ title, subheader, current, original, ...other }) {
  const theme = useTheme();

  // Calculate percentage
  const percentage = original > 0 ? (current / original) * 100 : 0;

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      width: 0,
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: theme.palette.primary.light, opacity: 1 },
          { offset: 100, color: theme.palette.primary.main, opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: '80%',
        },
        dataLabels: {
          showOn: 'always',
          name: {
            offsetY: -10,
            show: true,
            color: theme.palette.text.secondary,
            fontSize: '10px',
            fontWeight: 500,
          },
          value: {
            offsetY: 5,
            color: theme.palette.text.primary,
            fontSize: '18px',
            fontWeight: 700,
            show: true,
            formatter: (val) => `${val.toFixed(1)}%`,
          },
          total: {
            show: true,
            label: 'Remaining',
            color: theme.palette.text.secondary,
            fontSize: '13px',
            fontWeight: 500,
            formatter: () => `${percentage.toFixed(1)}%`,
          },
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ display: 'flex', alignItems: 'center', p: 3, justifyContent: 'space-around' }}>
        <Chart
          dir="ltr"
          type="radialBar"
          series={[percentage]}
          options={chartOptions}
          width={240}
          height={240}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Current Depth
            </Typography>
            <Typography variant="subtitle2">{fNumber(current)} mm</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Original Depth
            </Typography>
            <Typography variant="subtitle2">{fNumber(original)} mm</Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
