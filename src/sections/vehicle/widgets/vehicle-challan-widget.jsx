import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { fDateTime } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { useTenant } from 'src/query/use-tenant';
import { useFetchVehicleChallans, useCachedVehicleChallans } from 'src/query/use-challan';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

function splitResultsToBuckets(resultsArray) {
  const pending = [];
  const disposed = [];
  (resultsArray || []).forEach((r) => {
    const disp = toDisplayRow(r);
    const status = String(disp.status || '').toLowerCase();
    if (status === 'disposed') disposed.push(disp);
    else pending.push(disp);
  });
  return { pending, disposed, pendingCount: pending.length, disposedCount: disposed.length };
}

function toDisplayRow(item) {
  return {
    challanNo: item?.challanNo || '-',
    challanDateTime: item?.challanDateTime || item?.challanDate || null,
    place: item?.place || '-',
    status: item?.status || '-',
    fineImposed: item?.fineImposed ?? item?.amountOfFineImposed ?? null,
    receivedAmount: item?.receivedAmount ?? null,
    courtName: item?.courtName || '-',
    offenceDetails: Array.isArray(item?.offenceDetails) ? item.offenceDetails : [],
    stateCode: item?.stateCode || null,
  };
}

// Reusable popover content for challan list
function ChallanPopoverContent({ challans, title, labelColor, theme, isPending }) {
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: `dashed 1px ${theme.vars.palette.divider}` }}
      >
        <Typography variant="h6">{title}</Typography>
        {isPending && (
          <Button
            size="small"
            variant="soft"
            color="primary"
            startIcon={<Iconify icon="mdi:credit-card-outline" />}
            href="https://echallan.parivahan.gov.in/index/accused-challan"
            target="_blank"
            rel="noopener"
          >
            Pay Online
          </Button>
        )}
      </Stack>
      <Scrollbar sx={{ maxHeight: 400 }}>
        {(!challans || challans.length === 0) && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No challans found.
            </Typography>
          </Box>
        )}
        {challans?.map((challan, index) => (
          <Stack
            key={index}
            sx={{
              p: 2,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
              '&:last-child': { borderBottom: 'none' },
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            spacing={1.5}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {challan.challanNo}
                </Typography>
                {challan.challanDateTime && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ color: 'text.secondary', typography: 'caption' }}
                  >
                    <Iconify icon="solar:calendar-date-bold" width={14} />
                    <span>{fDateTime(challan.challanDateTime)}</span>
                  </Stack>
                )}
              </Stack>
              <Label color={labelColor} variant="soft" sx={{ fontSize: 13, fontWeight: 700 }}>
                {challan.fineImposed != null ? `₹${challan.fineImposed}` : '-'}
              </Label>
            </Stack>

            {challan.place && challan.place !== '-' && (
              <Stack
                direction="row"
                alignItems="flex-start"
                spacing={0.5}
                sx={{ color: 'text.secondary', typography: 'body2' }}
              >
                <Iconify icon="solar:map-point-bold" width={16} sx={{ mt: 0.25, flexShrink: 0 }} />
                <span>{challan.place}</span>
              </Stack>
            )}

            {challan.offenceDetails && challan.offenceDetails.length > 0 && (
              <Box
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Offenses:
                </Typography>
                <Stack spacing={0.5}>
                  {challan.offenceDetails.map((o, idx) => (
                    <Typography
                      key={idx}
                      variant="caption"
                      display="flex"
                      alignItems="flex-start"
                      sx={{ color: 'text.primary' }}
                    >
                      <Box component="span" sx={{ mr: 0.75, color: 'text.disabled' }}>
                        •
                      </Box>
                      {o?.name || o?.act || 'Unknown offense'}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        ))}
      </Scrollbar>
    </>
  );
}

export function VehicleChallanWidget({ vehicleNo, isOwn, sx, ...other }) {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [cooldownInfo, setCooldownInfo] = useState(null);
  const [popoverType, setPopoverType] = useState(null); // 'pending' | 'disposed' | null
  const [anchorEl, setAnchorEl] = useState(null);

  const { data: tenant } = useTenant();
  const integrationEnabled = !!tenant?.integrations?.challanApi?.enabled;

  const { fetchChallans, isFetching } = useFetchVehicleChallans();
  const { data: cached } = useCachedVehicleChallans(vehicleNo);

  useEffect(() => {
    if (!cached) return;
    const pending = Array.isArray(cached?.results?.pending)
      ? cached.results.pending.map(toDisplayRow)
      : [];
    const disposed = Array.isArray(cached?.results?.disposed)
      ? cached.results.disposed.map(toDisplayRow)
      : [];
    const pendingCount = cached?.pendingCount ?? pending.length;
    const disposedCount = cached?.disposedCount ?? disposed.length;
    setData((prev) => prev || { pending, disposed, pendingCount, disposedCount, vehicleNo });
    setCooldownInfo({
      lastFetchedAt: cached?.lastFetchedAt || null,
      nextAllowedAt: cached?.nextAllowedAt || null,
      cached: true,
    });
  }, [cached, vehicleNo]);

  const disabledReason = useMemo(() => {
    if (!isOwn) return 'Available only for own vehicles';
    if (!integrationEnabled) return 'Challan integration not enabled';
    if (!vehicleNo) return 'Vehicle number unavailable';
    return null;
  }, [isOwn, integrationEnabled, vehicleNo]);

  const handleFetch = async () => {
    if (disabledReason) return;
    try {
      const res = await fetchChallans({ vehicleNo });
      const { results, pendingCount = 0, disposedCount = 0 } = res || {};
      const pending = Array.isArray(results?.pending) ? results.pending.map(toDisplayRow) : [];
      const disposed = Array.isArray(results?.disposed) ? results.disposed.map(toDisplayRow) : [];
      setData({ pending, disposed, pendingCount, disposedCount, vehicleNo: res?.vehicleNo });
      setCooldownInfo({
        lastFetchedAt: res?.lastFetchedAt || null,
        nextAllowedAt: res?.nextAllowedAt || null,
        cached: false,
      });
      if (!pending.length && !disposed.length) {
        toast.info('No challans found for this vehicle');
      }
    } catch (e) {
      if (e && (e.cached || e.message)) {
        const { lastFetchedAt, nextAllowedAt } = e || {};
        const resultsArr = Array.isArray(e?.results) ? e.results : [];
        const buckets = splitResultsToBuckets(resultsArr);
        setData({ ...buckets, vehicleNo });
        setCooldownInfo({
          message: e?.message || 'Fetch limited by cooldown',
          lastFetchedAt,
          nextAllowedAt,
          cached: !!e?.cached,
        });
      } else {
        const msg = e?.message || 'Failed to fetch challans';
        toast.error(msg);
      }
    }
  };

  const cooldownActive = useMemo(() => {
    if (!cooldownInfo?.nextAllowedAt) return false;
    const now = new Date();
    const next = new Date(cooldownInfo.nextAllowedAt);
    return next.getTime() > now.getTime();
  }, [cooldownInfo]);

  const counts = useMemo(
    () => ({
      pending: data?.pendingCount ?? (data?.pending?.length || 0),
      disposed: data?.disposedCount ?? (data?.disposed?.length || 0),
    }),
    [data]
  );

  const handleOpenPopover = (event, type) => {
    setPopoverType(type);
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setPopoverType(null);
    setAnchorEl(null);
  };

  const hasData = counts.pending > 0 || counts.disposed > 0;
  const color = counts.pending > 0 ? 'error' : hasData ? 'success' : 'info';

  const getLinkSx = (typeColor) => ({
    cursor: 'pointer',
    borderRadius: 1,
    p: 1,
    mx: -1,
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'baseline',
    gap: 1,
    justifyContent: 'flex-start',
    '&:hover': {
      bgcolor: varAlpha(theme.vars.palette[typeColor].mainChannel, 0.08),
    },
  });

  return (
    <>
      <Card
        sx={{
          py: 3,
          pl: 3,
          pr: 2.5,
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ...sx,
        }}
        {...other}
      >
        <Box sx={{ flexGrow: 1, zIndex: 1 }}>
          <ButtonBase
            onClick={(e) => counts.pending > 0 && handleOpenPopover(e, 'pending')}
            disableRipple={counts.pending === 0}
            sx={{
              ...getLinkSx('error'),
              ...(!hasData && { mb: 1, display: 'inline-flex' }),
              width: 'auto',
            }}
          >
            <Box
              sx={{ typography: 'h3', color: counts.pending > 0 ? `error.main` : 'text.primary' }}
            >
              {counts.pending}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Pending Challans
            </Typography>
          </ButtonBase>

          {hasData && (
            <ButtonBase
              onClick={(e) => counts.disposed > 0 && handleOpenPopover(e, 'disposed')}
              disableRipple={counts.disposed === 0}
              sx={{ ...getLinkSx('success'), mt: 0.5, gap: 0.75, width: 'auto' }}
            >
              <Box sx={{ typography: 'subtitle1', color: 'success.main' }}>{counts.disposed}</Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Paid
              </Typography>
            </ButtonBase>
          )}

          {!hasData && (
            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 500, mt: 0.5 }}>
              No challans recorded
            </Typography>
          )}
        </Box>

        {/* Refresh icon button at bottom right */}
        <Tooltip
          title={
            disabledReason ||
            (cooldownActive && cooldownInfo?.nextAllowedAt
              ? `Next sync allowed at ${fDateTime(cooldownInfo.nextAllowedAt)}`
              : 'Refresh challans')
          }
        >
          <span style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
            <IconButton
              size="small"
              onClick={handleFetch}
              disabled={!!disabledReason || isFetching || cooldownActive}
              sx={{
                color: 'text.secondary',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Iconify
                icon={isFetching ? 'line-md:loading-twotone-loop' : 'solar:refresh-bold-duotone'}
                width={18}
              />
            </IconButton>
          </span>
        </Tooltip>

        {/* Main widget icon matching Odometer */}
        <Iconify
          icon="mdi:police-badge"
          width={36}
          height={36}
          sx={{
            top: 24,
            right: 20,
            position: 'absolute',
            background: `linear-gradient(135deg, ${theme.vars.palette[color].main} 0%, ${theme.vars.palette[color].dark} 100%)`,
            borderRadius: 1,
            p: 0.5,
            color: 'common.white',
          }}
        />

        <Box
          sx={{
            top: -44,
            width: 160,
            zIndex: 0,
            height: 160,
            right: -104,
            opacity: 0.12,
            borderRadius: 3,
            position: 'absolute',
            transform: 'rotate(40deg)',
            background: `linear-gradient(to right, ${theme.vars.palette[color].main} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0)} 100%)`,
          }}
        />
      </Card>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { width: 380, p: 0, mt: 1, borderRadius: 2 },
          },
        }}
      >
        {popoverType === 'pending' && (
          <ChallanPopoverContent
            challans={data?.pending}
            title="Pending Challans"
            labelColor="error"
            theme={theme}
            isPending
          />
        )}
        {popoverType === 'disposed' && (
          <ChallanPopoverContent
            challans={data?.disposed}
            title="Paid Challans"
            labelColor="success"
            theme={theme}
            isPending={false}
          />
        )}
      </Popover>
    </>
  );
}

export default VehicleChallanWidget;
