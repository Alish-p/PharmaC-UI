import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { useTransporterVehicles } from 'src/query/use-vehicle';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function TransporterVehiclesWidget({ transporterId, title = 'Vehicles' }) {
  const { data: vehicles = [] } = useTransporterVehicles(transporterId);
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? vehicles : vehicles.slice(0, 5);

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={`Vehicles owned by the transporter (${vehicles?.length})`}
        sx={{ mb: 3 }}
      />

      <Scrollbar sx={{ minHeight: 364, ...(showAll && { maxHeight: 364 }) }}>
        <Box
          sx={{
            p: 3,
            gap: 3,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 360,
          }}
        >
          {vehicles.length ? (
            displayed.map((vehicle) => <Item key={vehicle._id} vehicle={vehicle} />)
          ) : (
            <Box sx={{ typography: 'body2', color: 'text.secondary' }}>No vehicles</Box>
          )}
        </Box>
      </Scrollbar>

      {vehicles.length > 5 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowAll((prev) => !prev)}
              endIcon={
                <Iconify
                  icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={18}
                  sx={{ ml: -0.5 }}
                />
              }
            >
              {showAll ? 'View less' : 'View all'}
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}

function Item({ vehicle, sx, ...other }) {
  return (
    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', ...sx }} {...other}>
      <Avatar>
        <Iconify icon="mdi-light:truck" />
      </Avatar>

      <ListItemText primary={vehicle.vehicleNo} secondary={vehicle.vehicleType} />

      <Tooltip title="View details">
        <IconButton>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default TransporterVehiclesWidget;
