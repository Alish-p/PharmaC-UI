import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow } from 'src/utils/format-time';

import { useTenant } from 'src/query/use-tenant';
import { useTransporterEwaybillsByState } from 'src/query/use-ewaybill';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

import { STATE_OPTIONS } from './constants';

/**
 * Helper to match state code or name input to a valid STATE_OPTIONS value
 */
function findStateCode(input) {
  if (!input) return null;
  const str = String(input).trim();
  if (!str) return null;

  // Direct match on code (e.g. "29" or "07" or 29)
  const paddedStr = str.length === 1 ? `0${str}` : str;
  const matchByCode = STATE_OPTIONS.find((s) => s.value === paddedStr || s.value === str);
  if (matchByCode) return matchByCode.value;

  // Match by state name/label (e.g. "Karnataka" or "Maharashtra")
  const matchByLabel = STATE_OPTIONS.find(
    (s) => s.label.trim().toLowerCase() === str.toLowerCase()
  );
  if (matchByLabel) return matchByLabel.value;

  return null;
}

/**
 * Robustly derive the default state code from tenant object:
 * 1. legalInfo.registeredState (code or name)
 * 2. address.state (code or name)
 * 3. legalInfo.gstNumber (first 2 digits)
 */
function deriveStateFromTenant(tenant) {
  if (!tenant) return '';

  // 1. Try legalInfo.registeredState
  const fromReg = findStateCode(tenant?.legalInfo?.registeredState);
  if (fromReg) return fromReg;

  // 2. Try address.state
  const fromAddr = findStateCode(tenant?.address?.state);
  if (fromAddr) return fromAddr;

  // 3. Try GSTIN first 2 digits
  const gst = tenant?.legalInfo?.gstNumber;
  if (gst && typeof gst === 'string' && gst.length >= 2) {
    const code = gst.substring(0, 2);
    const fromGst = findStateCode(code);
    if (fromGst) return fromGst;
  }

  return '';
}

export function EwaybillByStateWidget({ title = 'E-Waybills by State', ...other }) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const { data: tenant } = useTenant();
  const queryClient = useQueryClient();

  // Pre-populate state from tenant's registeredState, address.state, or GSTIN
  useEffect(() => {
    if (tenant && !selectedState) {
      const defaultState = deriveStateFromTenant(tenant);
      if (defaultState) {
        setSelectedState(defaultState);
      }
    }
  }, [tenant, selectedState]);

  const params = useMemo(
    () => ({
      generated_date: selectedDate.format('DD/MM/YYYY'),
      state_code: selectedState,
      ...(forceRefresh && { force: true }),
    }),
    [selectedDate, selectedState, forceRefresh]
  );

  const { data, isLoading, isFetching } = useTransporterEwaybillsByState(params);

  useEffect(() => {
    if (!isFetching && forceRefresh && data) {
      const normalParams = {
        generated_date: selectedDate.format('DD/MM/YYYY'),
        state_code: selectedState,
      };
      queryClient.setQueryData(['ewaybill', 'transporter', 'by-state', normalParams], data);
      setForceRefresh(false);
    }
  }, [isFetching, forceRefresh, data, selectedDate, selectedState, queryClient]);

  const handleSync = () => {
    setForceRefresh(true);
  };

  const list = data?.results?.message || [];
  const total = list.length || 0;

  // Derive selected state label for the count display
  const selectedStateLabel = STATE_OPTIONS.find((s) => s.value === selectedState)?.label || '';

  const headLabel = [
    { id: 'index', label: 'No.' },
    { id: 'ewayBillNo', label: 'EWB No' },
    { id: 'ewayBillDate', label: 'EWB Date' },
    { id: 'documentNumber', label: 'Document No' },
    { id: 'placeOfDelivery', label: 'Place of Delivery' },
    { id: 'customer', label: 'Customer' },
    { id: 'subtrip', label: 'Subtrip' },
    { id: 'actions', label: 'Actions' },
  ];

  return (
    <Card {...other}>
      <Box
        sx={{
          px: 3,
          pt: 3,
          mb: 2,
          gap: 2,
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              mb: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              typography: 'subtitle2',
            }}
          >
            {title}
            {selectedStateLabel && (
              <Label variant="soft" color="info" sx={{ ml: 0.5 }}>
                {selectedStateLabel}
              </Label>
            )}
          </Box>
          <Box sx={{ typography: 'h4' }}>{selectedState ? total : '—'}</Box>
          {data?.fetchedAt && (
            <Box sx={{ typography: 'caption', color: 'text.disabled', mt: 0.5 }}>
              Last fetched: {fToNow(data.fetchedAt)} ago
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          }}
        >
          {/* State dropdown */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="ewb-state-label">State</InputLabel>
            <Select
              labelId="ewb-state-label"
              id="ewb-state-select"
              value={selectedState}
              label="State"
              size="small"
              onChange={(e) => setSelectedState(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 260 },
                },
              }}
            >
              {STATE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Select date"
            value={selectedDate}
            onChange={(val) => val && setSelectedDate(val)}
            disableFuture
            slotProps={{ textField: { size: 'small' } }}
          />

          <Tooltip title="Sync from portal" arrow>
            <span>
              <IconButton
                onClick={handleSync}
                disabled={isLoading || isFetching || !selectedState}
                color="primary"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                  animation: isLoading || isFetching ? 'spin 1.5s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <Iconify icon="eva:sync-outline" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {!selectedState ? (
        <Box
          sx={{
            px: 3,
            pb: 3,
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            typography: 'body2',
          }}
        >
          <Iconify icon="mdi:map-marker-outline" width={20} sx={{ mr: 1 }} />
          Please select a state to fetch e-waybills
        </Box>
      ) : (
        <Scrollbar sx={{ minHeight: 260, maxHeight: 360 }}>
          <Table size="small" sx={{ minWidth: 1040 }}>
            <TableHeadCustom headLabel={headLabel} />
            <TableBody>
              {isLoading || isFetching ? (
                <TableSkeleton />
              ) : list && list.length ? (
                <>
                  {list.map((row, idx) => {
                    const customerName = row?.customer?.name || '-';
                    const subtripCreated = Boolean(row?.hasSubtrip);
                    const subtripId =
                      row?.subtripId?._id ||
                      row?.subtripId ||
                      row?.subtrip_id ||
                      row?.subtrip?._id ||
                      row?.subtrip?.id ||
                      null;
                    const ewbNo = row?.eway_bill_number || row?.ewayBillNo || row?.ewayBill || '';
                    return (
                      <TableRow key={row?.eway_bill_number || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {ewbNo ? (
                            <Link
                              component={RouterLink}
                              to={{
                                pathname: paths.dashboard.subtrip.jobCreate,
                                search: `?ewayBill=${encodeURIComponent(ewbNo)}`,
                              }}
                              variant="body2"
                              noWrap
                              sx={{ color: 'primary.main' }}
                            >
                              {ewbNo}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{row?.eway_bill_date || '-'}</TableCell>
                        <TableCell>{row?.document_number || '-'}</TableCell>
                        <TableCell>{row?.place_of_delivery || '-'}</TableCell>
                        <TableCell>{customerName}</TableCell>
                        <TableCell>
                          <Label variant="soft" color={subtripCreated ? 'success' : 'warning'}>
                            {subtripCreated ? 'Created' : 'Not Created'}
                          </Label>
                        </TableCell>
                        <TableCell>
                          {subtripCreated ? (
                            <Tooltip title={subtripId ? 'View Job Details' : 'Job exists'} arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component={subtripId ? RouterLink : 'button'}
                                  to={
                                    subtripId
                                      ? paths.dashboard.subtrip.details(subtripId)
                                      : undefined
                                  }
                                  disabled={!subtripId}
                                >
                                  <Iconify icon="mdi:open-in-new" width={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Create Job from this eWay Bill" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  component={RouterLink}
                                  to={{
                                    pathname: paths.dashboard.subtrip.jobCreate,
                                    search: ewbNo ? `?ewayBill=${encodeURIComponent(ewbNo)}` : '',
                                  }}
                                >
                                  <Iconify icon="mdi:plus-circle" width={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ) : (
                <TableNoData notFound />
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      )}
    </Card>
  );
}

export default EwaybillByStateWidget;
