import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useInfiniteVehicles } from 'src/query/use-vehicle';

import { LoadingSpinner } from 'src/components/loading-spinner';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VehicleFolderCard } from './vehicle-document-folder-card';
import { VehicleDocumentOverlay } from './vehicle-document-overlay';

const VEHICLE_PAGE_SIZE = 20;

export function VehicleDocumentGridContent() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteVehicles(
    { rowsPerPage: VEHICLE_PAGE_SIZE, isOwn: true },
    { enabled: true }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const vehicles = data ? data.pages.flatMap((p) => p.results || []) : [];
  const total = data?.pages?.[0]?.total || 0;

  const handleOpenVehicle = useCallback((v) => {
    setSelectedVehicle(v);
    setOverlayOpen(true);
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner sx={{ height: 320 }} />
      ) : (
        <>
          <Box
            gap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
            }}
          >
            {vehicles.map((v) => (
              <VehicleFolderCard key={v._id} vehicle={v} onOpen={handleOpenVehicle} />
            ))}
          </Box>
          <Box ref={loadMoreRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            {isFetchingNextPage && <LoadingSpinner />}
            {!hasNextPage && (
              <Typography variant="caption" color="text.secondary">
                Showing {vehicles.length} of {total}
              </Typography>
            )}
          </Box>
        </>
      )}

      <VehicleDocumentOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        vehicle={selectedVehicle}
      />
    </>
  );
}

export function VehicleDocumentGridView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Documents Grid"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vehicle', href: paths.dashboard.vehicle.root },
          { name: 'Documents Grid' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <VehicleDocumentGridContent />
    </DashboardContent>
  );
}

export default VehicleDocumentGridView;
