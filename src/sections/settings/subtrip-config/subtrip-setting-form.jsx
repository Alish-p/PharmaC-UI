import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useMaterialOptions } from 'src/hooks/use-material-options';

import { useTenant, useUpdateTenant } from 'src/query/use-tenant';

import { Form, Field } from 'src/components/hook-form';

import { FREIGHT_MODEL_OPTIONS } from 'src/sections/subtrip/constants';

// ----------------------------------------------------------------------

const FIELDS_KEYS = [
  { key: 'invoiceNo', defaultLabel: 'Invoice No' },
  { key: 'vehicleAssignment', defaultLabel: 'Vehicle Assignment' },
  { key: 'ewayBill', defaultLabel: 'Eway Bill' },
  { key: 'ewayExpiryDate', defaultLabel: 'Eway Expiry Date' },
  { key: 'shipmentNo', defaultLabel: 'Shipment No' },
  { key: 'orderNo', defaultLabel: 'Order No' },
  { key: 'referenceSubtripNo', defaultLabel: 'Reference Job No' },
  { key: 'diNumber', defaultLabel: 'DI/DO No' },
  { key: 'consignee', defaultLabel: 'Consignee' },
  { key: 'loadingPoint', defaultLabel: 'Loading Point' },
  { key: 'unloadingPoint', defaultLabel: 'Unloading Point' },
  { key: 'materialType', defaultLabel: 'Material Type' },
  { key: 'grade', defaultLabel: 'Grade' },
  { key: 'quantity', defaultLabel: 'Quantity' },
  { key: 'remarks', defaultLabel: 'Remarks' },
];

const SubtripSettingSchema = zod.object({
  materialOptions: zod
    .array(zod.object({ label: zod.string(), value: zod.string() }))
    .optional(),
  freightConfig: zod
    .object({
      allowedModels: zod.array(zod.string()).min(1, 'At least one freight model must be allowed'),
      defaultModel: zod.string().min(1, 'Default freight model is required'),
    })
    .superRefine((data, ctx) => {
      if (data.allowedModels && !data.allowedModels.includes(data.defaultModel)) {
        ctx.addIssue({
          path: ['defaultModel'],
          code: zod.ZodIssueCode.custom,
          message: 'Default model must be one of the allowed models',
        });
      }
    }),
  fields: zod.record(
    zod.string(),
    zod.object({
      label: zod.string().min(1, 'Field label is required'),
      visibility: zod.enum(['required', 'optional', 'hidden']),
    })
  ),
});

export default function SubtripSettingForm() {
  const { data: currentTenant, isLoading } = useTenant();
  const updateTenant = useUpdateTenant();
  const globalMaterialOptions = useMaterialOptions();

  const defaultValues = useMemo(() => {
    const subtripConfig = currentTenant?.config?.subtrip || {};
    const fieldsInit = {};
    FIELDS_KEYS.forEach(({ key, defaultLabel }) => {
      const fieldData = subtripConfig?.fields?.[key] || {};
      fieldsInit[key] = {
        label: fieldData.label || defaultLabel,
        visibility: fieldData.visibility || 'optional',
      };
    });

    return {
      materialOptions: subtripConfig?.materialOptions || globalMaterialOptions,
      freightConfig: {
        allowedModels: subtripConfig?.allowedFreightModels || ['per_ton'],
        defaultModel: subtripConfig?.defaultFreightModel || 'per_ton',
      },
      fields: fieldsInit,
    };
  }, [currentTenant, globalMaterialOptions]);

  const methods = useForm({
    resolver: zodResolver(SubtripSettingSchema),
    defaultValues,
  });

  const { handleSubmit, control, watch, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (currentTenant) {
      reset(defaultValues);
    }
  }, [currentTenant, defaultValues, reset]);

  const watchedAllowedModels = watch('freightConfig.allowedModels');

  const defaultModelOptions = useMemo(
    () => FREIGHT_MODEL_OPTIONS.filter((model) => (watchedAllowedModels || []).includes(model.value)),
    [watchedAllowedModels]
  );

  const onSubmit = async (formData) => {
    await updateTenant({
      ...currentTenant,
      config: {
        ...currentTenant.config,
        subtrip: {
          ...currentTenant.config?.subtrip,
          materialOptions: formData.materialOptions,
          allowedFreightModels: formData.freightConfig.allowedModels,
          defaultFreightModel: formData.freightConfig.defaultModel,
          fields: formData.fields,
        },
      }
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Subtrip Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure default freight models, visible fields, required constraints, and material options for Subtrips (Jobs).
          </Typography>
        </Box>
      </Card>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title="Material Options"
              subheader="Manage materials that can be selected when creating a subtrip."
              sx={{ px: 0, pt: 0, mb: 3 }}
            />
            <Divider sx={{ mb: 3 }} />
            <Field.MultiAutocompleteFreeSolo
              name="materialOptions"
              label="Material Options"
              options={globalMaterialOptions}
            />
          </Card>

          {/* Freight Configuration */}
          <Card sx={{ p: 3 }}>
            <CardHeader
              title="Freight Model Configuration"
              subheader="Select allowed freight models for subtrips and the default model to pre-select."
              sx={{ px: 0, pt: 0, mb: 3 }}
            />
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.MultiSelect
                  name="freightConfig.allowedModels"
                  label="Allowed Freight Models"
                  placeholder="Select allowed models"
                  checkbox
                  chip
                  options={FREIGHT_MODEL_OPTIONS}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Select
                  name="freightConfig.defaultModel"
                  label="Default Freight Model"
                  fullWidth
                >
                  {defaultModelOptions.map((model) => (
                    <MenuItem key={model.value} value={model.value}>
                      {model.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
            </Grid>
          </Card>

          {/* Field Configuration */}
          <Card>
            <CardHeader
              title="Field Customizations"
              subheader="Set standard display labels and choose the visibility state for each field in forms."
              sx={{ p: 3 }}
            />
            <Divider />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell sx={{ minWidth: 240 }}>Custom Label</TableCell>
                    <TableCell align="right">Visibility</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FIELDS_KEYS.map(({ key, defaultLabel }) => (
                    <TableRow key={key} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{defaultLabel}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {key}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Field.Text
                          name={`fields.${key}.label`}
                          size="small"
                          placeholder={defaultLabel}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Controller
                          name={`fields.${key}.visibility`}
                          control={control}
                          render={({ field }) => (
                            <ToggleButtonGroup
                              value={field.value}
                              exclusive
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  field.onChange(newValue);
                                }
                              }}
                              size="small"
                              color="primary"
                            >
                              <ToggleButton
                                value="required"
                                sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}
                              >
                                Required
                              </ToggleButton>
                              <ToggleButton
                                value="optional"
                                sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}
                              >
                                Optional
                              </ToggleButton>
                              <ToggleButton
                                value="hidden"
                                sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}
                              >
                                Hidden
                              </ToggleButton>
                            </ToggleButtonGroup>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
                size="large"
              >
                Save Settings
              </LoadingButton>
            </Box>
          </Card>
        </Stack>
      </Form>
    </Stack>
  );
}
