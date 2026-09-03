/* eslint-disable react/prop-types */
import React from 'react';
import dayjs from 'dayjs';

import { Box, Stack, Paper, Divider, Typography } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { loadingWeightUnit } from '../../vehicle/vehicle-config';

// ----------------------------------------------------------------------

export function SubtripReceiveSettlementSummary({
  selectedSubtrip,
  freightDetails,
  commissionDetails,
  hasShortage,
  shortageAmount,
  shortageWeight,
  endDate,
}) {
  if (!selectedSubtrip) return null;

  const { isOwn, vehicleType } = selectedSubtrip.vehicleId || {};
  const freightModel = selectedSubtrip.freightDetails?.freightModel || 'per_ton';

  const grossFreight = Number(freightDetails?.freightAmount || 0);
  const commission = isOwn ? 0 : Number(commissionDetails?.commissionAmount || 0);
  const shortage = hasShortage && shortageAmount ? Number(shortageAmount) : 0;
  const netPayable = grossFreight - commission - shortage;

  const getFreightExplanation = () => {
    const rate = selectedSubtrip?.freightDetails?.rate || 0;
    if (freightModel === 'per_hour' && endDate && selectedSubtrip?.startDate) {
      const start = dayjs(selectedSubtrip.startDate);
      const end = dayjs(endDate);
      const diffInHours = Math.ceil(end.diff(start, 'hour', true));
      return `calculated for ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} at ₹${rate}/hour (job dates: ${dayjs(selectedSubtrip.startDate).format('DD MMM YYYY, hh:mm A')} to ${dayjs(endDate).format('DD MMM YYYY, hh:mm A')})`;
    }
    if (freightModel === 'per_km') {
      const startKm = selectedSubtrip?.freightDetails?.startKm || 0;
      const endKm = Number(freightDetails?.endKm || startKm);
      const diffKm = endKm > startKm ? endKm - startKm : 0;
      return `calculated for ${diffKm} km at ₹${rate}/km (KM: ${startKm} to ${endKm})`;
    }
    if (freightModel === 'hybrid') {
      const startKm = selectedSubtrip?.freightDetails?.startKm || 0;
      const endKm = Number(freightDetails?.endKm || startKm);
      const totalKm = endKm > startKm ? endKm - startKm : 0;
      const baseKm = selectedSubtrip?.freightDetails?.baseKm || 0;
      const baseFreight = selectedSubtrip?.freightDetails?.freightAmount || 0;
      const extraKm = totalKm > baseKm ? totalKm - baseKm : 0;
      return `calculated using base freight of ₹${baseFreight} (${baseKm} km) + extra ${extraKm} km at ₹${rate}/km`;
    }
    if (freightModel === 'per_ton' || freightModel === 'per_kl') {
      const weight = selectedSubtrip?.loadingWeight || 0;
      const unit = freightModel === 'per_kl' ? 'KL' : loadingWeightUnit[vehicleType] || 'tons';
      const rateLabel = freightModel === 'per_kl' ? 'KL' : 'ton';
      return `calculated for loading ${freightModel === 'per_kl' ? 'volume' : 'weight'} of ${weight} ${unit} at ₹${rate}/${rateLabel}`;
    }
    if (freightModel === 'fixed') {
      const baseFreight = selectedSubtrip?.freightDetails?.freightAmount || 0;
      return `fixed freight amount of ₹${baseFreight}`;
    }
    return 'rate model';
  };

  const getCommissionExplanation = () => {
    if (isOwn) return '';
    if (freightModel === 'per_ton' || freightModel === 'per_kl') {
      const rate = commissionDetails?.commissionRate || 0;
      const weight = selectedSubtrip?.loadingWeight || 0;
      const unit = freightModel === 'per_kl' ? 'KL' : loadingWeightUnit[vehicleType] || 'tons';
      const rateLabel = freightModel === 'per_kl' ? 'KL' : 'ton';
      return `calculated at ₹${rate}/${rateLabel} for loading ${freightModel === 'per_kl' ? 'volume' : 'weight'} of ${weight} ${unit}`;
    }
    return 'fixed commission amount';
  };

  const getShortageExplanation = () => {
    if (!hasShortage) return '';
    const weight = shortageWeight || 0;
    const unit = freightModel === 'per_kl' ? 'KL' : loadingWeightUnit[vehicleType] || 'tons';
    return `deducted for shortage ${freightModel === 'per_kl' ? 'volume' : 'weight'} of ${weight} ${unit}`;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        gridColumn: '1 / -1',
        bgcolor: 'background.neutral',
        borderRadius: 1.5,
        borderStyle: 'dashed',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
        Settlement Estimation
      </Typography>
      <Stack spacing={1.5}>
        {/* Gross Freight */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Gross Freight
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              ({getFreightExplanation()})
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {fCurrency(grossFreight)}
          </Typography>
        </Stack>

        {/* Commission Deduction (only for Market vehicles) */}
        {!isOwn && (
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                Transporter Commission
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                ({getCommissionExplanation()})
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              -{fCurrency(commission)}
            </Typography>
          </Stack>
        )}

        {/* Shortage Deduction (if active) */}
        {hasShortage && (
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                Shortage Deduction
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                ({getShortageExplanation()})
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              -{fCurrency(shortage)}
            </Typography>
          </Stack>
        )}

        <Divider />

        {/* Net Payable / Margin */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {isOwn ? 'Net Freight (Billing)' : 'Net Payable to Transporter'}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            {fCurrency(netPayable)}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
