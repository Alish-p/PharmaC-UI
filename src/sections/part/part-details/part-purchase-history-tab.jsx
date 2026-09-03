import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

export function PartPurchaseHistoryTab() {
  return (
    <Card>
      <CardHeader title="Purchase History" />
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Purchase history will appear here.
        </Typography>
      </Box>
    </Card>
  );
}
