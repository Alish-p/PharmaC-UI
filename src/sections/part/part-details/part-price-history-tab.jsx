import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import axios from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';
import { LoadingScreen } from 'src/components/loading-screen';

export function PartPriceHistoryTab({ partId, currentAverageCost }) {
  const theme = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/api/maintenance/parts/${partId}/price-history`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partId) {
      fetchHistory();
    }
  }, [partId]);

  const chartSeries = [
    {
      name: 'Unit Price',
      data: history.map((item) => item.price),
    },
  ];

  const chartOptions = useChart({
    xaxis: {
      categories: history.map((item) => fDate(item.date)),
    },
    colors: [theme.palette.primary.main],
    tooltip: {
      y: {
        formatter: (value, { dataPointIndex }) => {
          const item = history[dataPointIndex];
          if (item) {
            return `${fCurrency(value)} | Qty: ${item.quantity} | ${item.vendor}`;
          }
          return fCurrency(value);
        },
        title: {
          formatter: () => 'Price: ',
        },
      },
    },
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Current Average Cost
          </Typography>
          <Typography variant="h3">{fCurrency(currentAverageCost)}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Calculated from inventory weighted average
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Price History" subheader="Based on purchase receipts" />
          <Box sx={{ p: 3, pb: 1 }}>
            {history.length > 0 ? (
              <Chart type="line" series={chartSeries} options={chartOptions} height={320} />
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 320 }}>
                <Typography variant="body2" color="text.secondary">
                  No price history available
                </Typography>
              </Stack>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
