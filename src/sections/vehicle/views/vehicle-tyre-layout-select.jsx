import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';

import { useUpdateVehicle, useGetTyreLayouts } from 'src/query/use-vehicle';

import { Label } from 'src/components/label';

import { TyreLayoutDiagram } from '../components/tyre-layout-diagram';

// ----------------------------------------------------------------------

export function VehicleTyreLayoutSelect({ vehicle }) {
  const { data: layoutsData, isLoading } = useGetTyreLayouts();
  const updateVehicle = useUpdateVehicle();

  const [selectedLayoutId, setSelectedLayoutId] = useState(null);
  const [filterTyreCount, setFilterTyreCount] = useState('all');

  const layouts = layoutsData?.data || [];

  const getTyreCount = (layout) =>
    layout.tyres.filter((t) => !String(t).toLowerCase().includes('stepney')).length;

  const getTyreCounts = () => {
    if (isLoading) return [];
    const counts = layouts.map((layout) => getTyreCount(layout));
    const uniqueCounts = [...new Set(counts)].sort((a, b) => a - b);
    return uniqueCounts;
  };

  const tyreCounts = getTyreCounts();

  const filteredLayouts =
    filterTyreCount === 'all'
      ? layouts
      : layouts.filter((layout) => getTyreCount(layout) === filterTyreCount);

  const handleSave = async () => {
    try {
      await updateVehicle({
        id: vehicle._id,
        data: { tyreLayoutId: selectedLayoutId },
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Select Tyre Layout</Typography>
        <Button variant="contained" onClick={handleSave} disabled={!selectedLayoutId}>
          Save Layout
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip
          label="All"
          onClick={() => setFilterTyreCount('all')}
          color={filterTyreCount === 'all' ? 'primary' : 'default'}
          variant={filterTyreCount === 'all' ? 'filled' : 'outlined'}
          clickable
        />
        {tyreCounts.map((count) => (
          <Chip
            key={count}
            label={`${count} Tyre`}
            onClick={() => setFilterTyreCount(count)}
            color={filterTyreCount === count ? 'primary' : 'default'}
            variant={filterTyreCount === count ? 'filled' : 'outlined'}
            clickable
          />
        ))}
      </Stack>

      <Grid container spacing={3}>
        {filteredLayouts.map((layout) => {
          const isSelected = selectedLayoutId === layout.id;
          return (
            <Grid xs={12} sm={6} md={4} key={layout.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: (theme) =>
                    isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                  bgcolor: (theme) =>
                    isSelected ? theme.palette.action.selected : 'background.paper',
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedLayoutId(layout.id)}
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="subtitle1">{layout.name}</Typography>
                    <Label color="primary" variant="filled">
                      {getTyreCount(layout)} Tyre
                    </Label>
                  </Stack>

                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <TyreLayoutDiagram
                      positions={layout.tyres.filter(
                        (t) => !String(t).toLowerCase().includes('stepney')
                      )}
                    />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
