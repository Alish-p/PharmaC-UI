import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import LoadingButton from '@mui/lab/LoadingButton';

import { useUpdateTenant } from 'src/query/use-tenant';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const VEHICLE_MODE_OPTIONS = [
  {
    value: VEHICLE_MODES.OWN_ONLY,
    label: 'Owned Fleet Only',
    description: 'Client manages only their own company-owned vehicles.',
    icon: 'mdi:truck-check',
  },
  {
    value: VEHICLE_MODES.MARKET_ONLY,
    label: 'Market Vehicles Only',
    description: 'Client hires vehicles exclusively from external transporters.',
    icon: 'mdi:truck-fast',
  },
  {
    value: VEHICLE_MODES.BOTH,
    label: 'Both',
    description: 'Client manages both owned fleet and hired market vehicles.',
    icon: 'mdi:truck-delivery',
  },
];

const VehicleSettingSchema = zod.object({
  config: zod.object({
    vehicle: zod
      .object({
        vehicleMode: zod.enum(Object.values(VEHICLE_MODES)).optional(),
        types: zod.array(zod.object({ label: zod.string(), value: zod.string() })).optional(),
        companies: zod.array(zod.object({ label: zod.string(), value: zod.string() })).optional(),
        models: zod.array(zod.object({ label: zod.string(), value: zod.string() })).optional(),
        engineTypes: zod.array(zod.object({ label: zod.string(), value: zod.string() })).optional(),
      })
      .optional(),
  }),
});

export default function VehicleSettingForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();

  const defaultValues = useMemo(
    () => ({
      config: {
        vehicle: {
          vehicleMode: currentTenant?.config?.vehicle?.vehicleMode ?? VEHICLE_MODES.BOTH,
          types: currentTenant?.config?.vehicle?.types || [],
          companies: currentTenant?.config?.vehicle?.companies || [],
          models: currentTenant?.config?.vehicle?.models || [],
          engineTypes: currentTenant?.config?.vehicle?.engineTypes || [],
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({
    resolver: zodResolver(VehicleSettingSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const vehicleMode = watch('config.vehicle.vehicleMode');

  const onSubmit = async (data) => {
    try {
      const sanitized = {
        ...currentTenant,
        config: {
          ...currentTenant?.config,
          ...data.config,
        },
      };
      await updateTenant(sanitized);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        <Card>
          <CardHeader
            title="System Settings"
            subheader="Configure what type of vehicles this client manages."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="mdi:truck-fast" />
                <Typography variant="subtitle2">Vehicle Management Mode</Typography>
                <Tooltip title="Controls which vehicle-related features and columns are visible across the app. 'Owned Fleet Only' hides transporter/advance/payment features. 'Market Vehicles Only' hides own-fleet management. 'Both' shows everything.">
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify
                      icon="eva:info-outline"
                      width={16}
                      sx={{ color: 'text.disabled', ml: 0.5 }}
                    />
                  </Box>
                </Tooltip>
              </Stack>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
                gap={2.5}
                sx={{ mt: 1 }}
              >
                {VEHICLE_MODE_OPTIONS.map((option) => {
                  const isSelected = vehicleMode === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      onClick={() => setValue('config.vehicle.vehicleMode', option.value)}
                      sx={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: 2,
                        position: 'relative',
                        transition: (theme) =>
                          theme.transitions.create(['all'], {
                            duration: theme.transitions.duration.shorter,
                          }),
                        border: (theme) =>
                          `2px solid ${
                            isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)
                          }`,
                        bgcolor: (theme) =>
                          isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                        boxShadow: (theme) => (isSelected ? theme.customShadows.z12 : 'none'),
                        '&:hover': {
                          borderColor: (theme) =>
                            isSelected ? theme.palette.primary.main : theme.palette.text.disabled,
                          transform: 'translateY(-3px)',
                          boxShadow: (theme) => theme.customShadows.z8,
                          '& .icon-wrapper': {
                            transform: 'scale(1.1)',
                            bgcolor: (theme) =>
                              isSelected
                                ? alpha(theme.palette.primary.main, 0.16)
                                : alpha(theme.palette.grey[500], 0.16),
                          },
                        },
                      }}
                    >
                      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Box
                            className="icon-wrapper"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: (theme) =>
                                isSelected
                                  ? alpha(theme.palette.primary.main, 0.12)
                                  : alpha(theme.palette.grey[500], 0.08),
                              color: isSelected ? 'primary.main' : 'text.secondary',
                              transition: (theme) =>
                                theme.transitions.create(['all'], {
                                  duration: theme.transitions.duration.shorter,
                                }),
                            }}
                          >
                            <Iconify icon={option.icon} width={28} />
                          </Box>

                          {isSelected && (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (theme) => theme.customShadows.z4,
                              }}
                            >
                              <Iconify icon="eva:checkmark-fill" width={16} />
                            </Box>
                          )}
                        </Box>

                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: isSelected ? 'text.primary' : 'text.secondary',
                            mb: 1,
                          }}
                        >
                          {option.label}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            </Stack>
          </Stack>
        </Card>

        <Card>
          <CardHeader
            title="Vehicle Configurations"
            subheader="Configure custom vehicle types, companies, models, and engine types for your fleet."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.MultiAutocompleteFreeSolo
              name="config.vehicle.types"
              label="Vehicle Types"
              placeholder="Add vehicle types"
              options={currentTenant?.config?.vehicle?.types || []}
            />

            <Field.MultiAutocompleteFreeSolo
              name="config.vehicle.companies"
              label="Vehicle Companies"
              placeholder="Add vehicle companies"
              options={currentTenant?.config?.vehicle?.companies || []}
            />

            <Field.MultiAutocompleteFreeSolo
              name="config.vehicle.models"
              label="Vehicle Models"
              placeholder="Add model numbers"
              options={currentTenant?.config?.vehicle?.models || []}
            />

            <Field.MultiAutocompleteFreeSolo
              name="config.vehicle.engineTypes"
              label="Engine Types"
              placeholder="Add engine classes (e.g. BS-6)"
              options={currentTenant?.config?.vehicle?.engineTypes || []}
            />
          </Stack>
        </Card>

        <Stack alignItems="flex-end">
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save Changes
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
