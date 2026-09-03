import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

export function PartWorkOrderActivityTab() {
  return (
    <Card>
      <CardHeader title="Work Order Activity" />
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Work order activity will appear here.
        </Typography>
      </Box>
    </Card>
  );
}
