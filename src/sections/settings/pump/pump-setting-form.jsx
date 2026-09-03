import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';

import { useUpdateTenant } from 'src/query/use-tenant';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const PumpSettingSchema = zod.object({
  config: zod.object({
    pump: zod
      .object({
        enabled: zod.boolean().optional(),
      })
      .optional(),
  }),
});

export default function PumpSettingForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();

  const defaultValues = useMemo(
    () => ({
      config: {
        pump: {
          enabled: currentTenant?.config?.pump?.enabled ?? true,
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({
    resolver: zodResolver(PumpSettingSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
            title="Pump Settings"
            subheader="Configure pump management and fuel logging features."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Switch
              name="config.pump.enabled"
              labelPlacement="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:gas-station" />
                  Manages Fuel Pumps
                  <Tooltip title="If disabled, all Pump-related functionality (pump list, fuel indent, pump expense forms, filters) will be hidden, streamlining the interface.">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Iconify
                        icon="eva:info-outline"
                        width={16}
                        sx={{ color: 'text.disabled', ml: 0.5 }}
                      />
                    </Box>
                  </Tooltip>
                </Stack>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
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
