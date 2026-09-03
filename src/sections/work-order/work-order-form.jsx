import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {
  Card,
  Menu,
  Stack,
  Table,
  Alert,
  Button,
  Dialog,
  Divider,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { useGps } from 'src/query/use-gps';
import { usePaginatedParts } from 'src/query/use-part';
import { usePaginatedPartLocations } from 'src/query/use-part-location';
import { useCreateWorkOrder, useUpdateWorkOrder } from 'src/query/use-work-order';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { useTenantContext } from 'src/auth/tenant';

import { KanbanPartsDialog } from '../kanban/components/kanban-parts-dialog';
import { KanbanVehicleDialog } from '../kanban/components/kanban-vehicle-dialog';
import { KanbanContactsDialog } from '../kanban/components/kanban-contacts-dialog';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_ISSUE_OPTIONS,
  WORK_ORDER_STATUS_OPTIONS,
  WORK_ORDER_PRIORITY_OPTIONS,
  WORK_ORDER_CATEGORY_OPTIONS,
} from './work-order-config';

const stringOrObjectSchema = (requiredMessage) =>
  zod.preprocess(
    (val) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && 'value' in val) return val.value;
      return val;
    },
    zod.string().min(1, { message: requiredMessage })
  );

const WorkOrderLineSchema = zod
  .object({
    part: zod.string().optional(),
    name: zod.string().optional(), // For custom items
    partLocation: zod.string().optional(),
    quantity: zod
      .number({ required_error: 'Quantity is required' })
      .min(1, { message: 'Quantity must be at least 1' }),
    price: zod
      .number({ required_error: 'Price is required' })
      .min(0, { message: 'Price cannot be negative' }),
    partSnapshot: zod.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.part && (!data.partLocation || data.partLocation.trim() === '')) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        path: ['partLocation'],
        message: 'Location is required',
      });
    }
  });

const WorkOrderIssueSchema = zod.object({
  issue: stringOrObjectSchema('Issue cannot be empty'),
  assignedTo: zod.array(zod.string()).optional(),
});

export const WorkOrderSchema = zod.object({
  vehicleId: zod.string().min(1, { message: 'Vehicle is required' }),
  category: zod.preprocess(
    (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object' && 'value' in val) return val.value;
      return val;
    },
    zod.string().min(1, { message: 'Category is required' })
  ),
  status: zod.enum(WORK_ORDER_STATUS_OPTIONS.map((s) => s.value)).optional(),
  priority: zod.enum(WORK_ORDER_PRIORITY_OPTIONS.map((p) => p.value)).default('non-scheduled'),
  scheduledStartDate: schemaHelper.date({ message: 'Scheduled start date is required' }),
  actualStartDate: schemaHelper.dateOptional().optional(),
  odometerReading: zod.preprocess(
    (val) => (val === '' || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    zod.number().nonnegative().optional()
  ),
  labourCharge: zod.preprocess(
    (val) => (val === '' || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    zod.number().nonnegative().optional()
  ),
  description: zod.string().optional(),
  workshopName: zod.string().optional(),
  billNo: zod.string().optional(),
  issues: zod.array(WorkOrderIssueSchema).min(1, { message: 'At least 1 issue is required' }),
  parts: zod.array(WorkOrderLineSchema).optional(),
});

export default function WorkOrderForm({ currentWorkOrder }) {
  const navigate = useNavigate();
  const tenant = useTenantContext();

  const vehicleDialog = useBoolean(false);
  const scheduledDateDialog = useBoolean(false);
  const actualDateDialog = useBoolean(false);

  const [selectedVehicle, setSelectedVehicle] = useState(currentWorkOrder?.vehicle || null);
  const [issueAssignees, setIssueAssignees] = useState({});
  const [activeIssueFieldId, setActiveIssueFieldId] = useState(null);
  const assigneeDialog = useBoolean(false);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const [activePartLineId, setActivePartLineId] = useState(null);
  const [lineParts, setLineParts] = useState({});

  const defaultValues = useMemo(
    () => ({
      vehicleId: currentWorkOrder?.vehicle?._id || currentWorkOrder?.vehicle || '',
      category: currentWorkOrder?.category || '',
      status: currentWorkOrder?.status || 'open',
      priority: currentWorkOrder?.priority || 'non-scheduled',
      scheduledStartDate: currentWorkOrder?.scheduledStartDate
        ? new Date(currentWorkOrder.scheduledStartDate)
        : null,
      actualStartDate: currentWorkOrder?.actualStartDate
        ? new Date(currentWorkOrder.actualStartDate)
        : null,
      odometerReading:
        typeof currentWorkOrder?.odometerReading === 'number'
          ? currentWorkOrder.odometerReading
          : undefined,
      labourCharge:
        typeof currentWorkOrder?.labourCharge === 'number' ? currentWorkOrder.labourCharge : 0,
      description: currentWorkOrder?.description || '',
      workshopName: currentWorkOrder?.workshopName || '',
      billNo: currentWorkOrder?.billNo || '',
      issues: (() => {
        if (!currentWorkOrder?.issues) return [{ issue: '', assignedTo: [] }];
        return currentWorkOrder.issues.map((issue) => {
          if (typeof issue === 'string') {
            return { issue, assignedTo: [] };
          }
          return {
            issue: issue.issue || '',
            assignedTo: Array.isArray(issue.assignedTo)
              ? issue.assignedTo.map((u) => u?._id || u || '')
              : issue.assignedTo
                ? [issue.assignedTo?._id || issue.assignedTo]
                : [],
          };
        });
      })(),
      parts: (currentWorkOrder?.parts || []).map((line) => ({
        part: line.part?._id || line.part || '',
        name: line.name || '',
        partLocation: line.partLocation?._id || line.partLocation || '',
        quantity: line.quantity || 1,
        price: line.price || 0,
        partSnapshot: line.partSnapshot,
      })),
    }),
    [currentWorkOrder]
  );

  const methods = useForm({
    resolver: zodResolver(WorkOrderSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    control,
    getValues,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    name: 'parts',
    control,
  });

  const {
    fields: issueFields,
    append: appendIssue,
    remove: removeIssue,
  } = useFieldArray({
    name: 'issues',
    control,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0) {
      console.log('RHF Validation Errors:', methods.formState.errors);
    }
  }, [methods.formState.errors]);

  const values = watch();
  const priorityMenuOpen = Boolean(priorityAnchorEl);

  const isExternalWorkshop =
    typeof values.category === 'object'
      ? values.category?.value === 'External Workshop'
      : values.category === 'External Workshop';

  const vehicleNo = selectedVehicle?.vehicleNo;
  const selectedVehicleId = selectedVehicle?._id || selectedVehicle || '';
  const previousVehicleIdRef = useRef(selectedVehicleId);

  const { data: gpsData } = useGps(vehicleNo, {
    enabled: !!vehicleNo,
  });

  useEffect(() => {
    const prev = previousVehicleIdRef.current;
    if (prev === selectedVehicleId) return;
    previousVehicleIdRef.current = selectedVehicleId;

    if (!selectedVehicleId) {
      setValue('odometerReading', undefined, { shouldDirty: false, shouldValidate: false });
      return;
    }

    setValue('odometerReading', 0, { shouldDirty: false, shouldValidate: true });
  }, [selectedVehicleId, setValue]);

  const isOdometerDirty = Boolean(dirtyFields?.odometerReading);

  useEffect(() => {
    if (!vehicleNo) return;
    if (!gpsData?.totalOdometer) return;

    if (isOdometerDirty) return;

    const current = getValues('odometerReading');
    const hasMeaningfulValue =
      current !== undefined && current !== null && current !== '' && current !== 0;
    if (hasMeaningfulValue) return;

    setValue('odometerReading', Math.round(gpsData.totalOdometer), {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [gpsData, vehicleNo, isOdometerDirty, getValues, setValue]);

  const { data: partsResponse } = usePaginatedParts(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );
  const parts = partsResponse?.parts || [];

  const { data: locationsResponse } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );
  const locations = locationsResponse?.locations || [];

  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const partDialog = useBoolean(false);

  const currentStatus = currentWorkOrder?.status || 'open';
  const headerStatusLabel = WORK_ORDER_STATUS_LABELS[currentStatus] || currentStatus;
  const headerStatusColor = WORK_ORDER_STATUS_COLORS[currentStatus] || 'info';

  const headerDate =
    values.scheduledStartDate ||
    values.actualStartDate ||
    currentWorkOrder?.createdAt ||
    new Date();

  useEffect(() => {
    if (!currentWorkOrder) {
      return;
    }

    if (!currentWorkOrder.issues || !issueFields.length) {
      setIssueAssignees({});
      return;
    }

    const mapping = {};
    issueFields.forEach((field, index) => {
      const existing = currentWorkOrder.issues?.[index];
      if (existing && typeof existing === 'object' && Array.isArray(existing.assignedTo)) {
        mapping[field.id] = existing.assignedTo;
      } else if (existing && typeof existing === 'object' && existing.assignedTo) {
        mapping[field.id] = [existing.assignedTo];
      }
    });

    setIssueAssignees(mapping);
  }, [currentWorkOrder, issueFields]);

  const partsCost = (values.parts || []).reduce((sum, line) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.price) || 0;
    return sum + qty * price;
  }, 0);

  const labour = Number(values.labourCharge) || 0;
  const total = partsCost + labour;
  const computed = { partsCost, total };

  const getLinePart = (fieldId, partId) =>
    lineParts[fieldId] || parts.find((p) => p._id === partId) || null;

  const activePartLineIndex = fields.findIndex((f) => f.id === activePartLineId);
  const activeLineSelectedPart =
    activePartLineIndex >= 0
      ? getLinePart(activePartLineId, values.parts?.[activePartLineIndex]?.part)
      : null;

  const handleVehicleChange = (vehicle) => {
    setSelectedVehicle(vehicle || null);
    setValue('vehicleId', vehicle?._id || '');
  };

  const handleIssueAssigneesChange = (assignees) => {
    if (!activeIssueFieldId) return;
    const index = issueFields.findIndex((f) => f.id === activeIssueFieldId);
    if (index < 0) return;

    setIssueAssignees((prev) => ({
      ...prev,
      [activeIssueFieldId]: assignees,
    }));

    setValue(
      `issues.${index}.assignedTo`,
      assignees.map((user) => user?._id || '').filter(Boolean),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const handleScheduledDateChange = (newDate) => {
    const jsDate = newDate ? newDate.toDate() : null;
    setValue('scheduledStartDate', jsDate, { shouldDirty: true, shouldValidate: true });
  };

  const handleActualDateChange = (newDate) => {
    const jsDate = newDate ? newDate.toDate() : null;
    setValue('actualStartDate', jsDate, { shouldDirty: true, shouldValidate: true });
  };

  const handlePriorityMenuClose = () => {
    setPriorityAnchorEl(null);
  };
  const handlePrioritySelect = (priorityValue) => {
    setValue('priority', priorityValue, { shouldDirty: true, shouldValidate: true });
    handlePriorityMenuClose();
  };

  const handlePartChange = (part) => {
    if (!activePartLineId) return;
    const lineIndex = fields.findIndex((f) => f.id === activePartLineId);
    if (lineIndex < 0) return;

    if (part.isCustom) {
      // Handle custom adhoc item
      setValue(`parts.${lineIndex}.part`, '', { shouldDirty: true });
      setValue(`parts.${lineIndex}.name`, part.name, { shouldDirty: true, shouldValidate: true });
      setValue(`parts.${lineIndex}.price`, 0, { shouldDirty: true }); // Default to 0 or let user edit

      setLineParts((prev) => ({
        ...prev,
        [activePartLineId]: null, // Clear stored part object
      }));
    } else {
      // Handle real inventory part
      setValue(`parts.${lineIndex}.part`, part._id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      const costToSet = part.averageUnitCost ?? part.price ?? part.unitCost ?? 0;
      setValue(`parts.${lineIndex}.price`, costToSet, {
        shouldValidate: true,
        shouldDirty: true,
      });
      // Clear custom name if selecting a real part
      setValue(`parts.${lineIndex}.name`, '', { shouldDirty: true });

      const currentLoc = getValues(`parts.${lineIndex}.partLocation`);
      if (!currentLoc && locations?.length > 0) {
        setValue(`parts.${lineIndex}.partLocation`, locations[0]._id, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      setLineParts((prev) => ({
        ...prev,
        [activePartLineId]: part,
      }));
    }

    setActivePartLineId(null);
    partDialog.onFalse();
  };

  const onSubmit = async (formData) => {
    try {
      const payload = {
        vehicle: formData.vehicleId,
        category:
          typeof formData.category === 'object'
            ? formData.category?.value
            : formData.category || undefined,
        status: formData.status || undefined,
        priority: formData.priority || undefined,
        scheduledStartDate: formData.scheduledStartDate || undefined,
        actualStartDate: formData.actualStartDate || undefined,
        odometerReading: formData.odometerReading || undefined,
        labourCharge: typeof formData.labourCharge === 'number' ? formData.labourCharge : 0,
        parts: (formData.parts || []).map((line) => ({
          part: line.part || undefined,
          name: line.name || undefined,
          partLocation: line.part ? line.partLocation || undefined : undefined,
          quantity: line.quantity,
          price: line.price,
        })),
        issues: (formData.issues || [])
          .filter((item) => {
            const issueText = typeof item?.issue === 'object' ? item.issue.value : item?.issue;
            return (
              item && issueText && typeof issueText === 'string' && issueText.trim().length > 0
            );
          })
          .map((item) => {
            const issueText = typeof item?.issue === 'object' ? item.issue.value : item?.issue;
            return {
              issue: issueText.trim(),
              assignedTo:
                Array.isArray(item.assignedTo) && item.assignedTo.length > 0
                  ? item.assignedTo
                  : undefined,
            };
          }),
        description: formData.description || undefined,
      };

      let saved;
      if (currentWorkOrder?._id) {
        saved = await updateWorkOrder({
          id: currentWorkOrder._id,
          data: payload,
        });
      } else {
        saved = await createWorkOrder(payload);
      }

      reset();
      if (saved?._id) {
        navigate(paths.dashboard.workOrder.details(saved._id));
      } else {
        navigate(paths.dashboard.workOrder.list);
      }
    } catch (error) {
      // errors are handled by hooks (toasts)
      console.error(error);
    }
  };

  const renderHeader = (
    <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box
        rowGap={3}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
        sx={{ mb: 3 }}
      >
        <Box
          component="img"
          alt="logo"
          src={getTenantLogoUrl(tenant)}
          sx={{ width: 60, height: 60, bgcolor: 'background.neutral', borderRadius: 1 }}
        />
        <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
          <Label variant="soft" color={headerStatusColor}>
            {headerStatusLabel}
          </Label>
          <Typography variant="h6">Work Order</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fDate(headerDate)}
          </Typography>
        </Stack>
      </Box>

      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 1 }}>
            From:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{tenant?.name}</Typography>
            <Typography variant="body2">{tenant?.address?.line1}</Typography>
            <Typography variant="body2">{tenant?.address?.line2}</Typography>
            <Typography variant="body2">{tenant?.address?.state}</Typography>
            <Typography variant="body2">Phone: {tenant?.contactDetails?.phone}</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 1 }}>
            Vehicle &amp; Schedule
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" sx={{ minWidth: 72 }}>
                Vehicle:
              </Typography>
              <IconButton size="small" color="primary" onClick={vehicleDialog.onTrue}>
                <Iconify icon={selectedVehicle ? 'solar:pen-bold' : 'mingcute:add-line'} />
              </IconButton>
              {selectedVehicle ? (
                <>
                  <Typography variant="body2">
                    {selectedVehicle.vehicleNo} ({selectedVehicle.vehicleType})
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      ml: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Odometer:
                    </Typography>
                    <Box sx={{ width: 150 }}>
                      <Field.Number
                        name="odometerReading"
                        label=""
                        size="small"
                        inputProps={{ min: 0 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">KM</InputAdornment>,
                        }}
                      />
                    </Box>
                  </Box>
                </>
              ) : (
                <Typography variant="caption" sx={{ color: 'error.main', ml: 0.5 }}>
                  Select a vehicle
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" sx={{ minWidth: 72 }}>
                Scheduled:
              </Typography>
              <IconButton size="small" color="primary" onClick={scheduledDateDialog.onTrue}>
                <Iconify icon="solar:calendar-linear" />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ color: values.scheduledStartDate ? 'text.primary' : 'text.secondary' }}
              >
                {values.scheduledStartDate ? fDate(values.scheduledStartDate) : 'Select date'}
              </Typography>
              {methods.formState.errors.scheduledStartDate && (
                <Typography variant="caption" color="error" sx={{ width: '100%', ml: 11 }}>
                  {methods.formState.errors.scheduledStartDate.message}
                </Typography>
              )}
            </Stack>

            {!!currentWorkOrder?._id && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" sx={{ minWidth: 72 }}>
                  Actual Start:
                </Typography>
                <IconButton size="small" color="primary" onClick={actualDateDialog.onTrue}>
                  <Iconify icon="solar:calendar-linear" />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ color: values.actualStartDate ? 'text.primary' : 'text.secondary' }}
                >
                  {values.actualStartDate ? fDate(values.actualStartDate) : 'Select date'}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Field.AutocompleteFreeSolo
          fullWidth
          required
          name="category"
          label="Category"
          options={WORK_ORDER_CATEGORY_OPTIONS.map((option) => ({ label: option, value: option }))}
        />

        <Field.Select name="priority" label="Priority" fullWidth InputLabelProps={{ shrink: true }}>
          {WORK_ORDER_PRIORITY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: (theme) =>
                      option.color === 'default'
                        ? 'text.disabled'
                        : theme.palette[option.color]?.main || 'text.disabled',
                  }}
                />
                <Typography variant="body2">{option.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Field.Select>

        {isExternalWorkshop && (
          <>
            <Field.Text
              name="workshopName"
              label="Workshop Name"
              placeholder="Optional"
              fullWidth
            />
            <Field.Text name="billNo" label="Bill No." placeholder="Optional" fullWidth />
          </>
        )}
      </Stack>
    </Card>
  );

  const renderIssues = (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:alert-circle-outline" width={20} />
            <Typography variant="h6">Issues</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            color="primary"
            onClick={() =>
              appendIssue({
                issue: '',
                assignedTo: [],
              })
            }
          >
            Add Issue
          </Button>
        </Stack>

        {issueFields.length === 0 ? (
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No issues added. Use &quot;Add Issue&quot; to capture reported problems or observations.
            </Typography>
            {methods.formState.errors.issues?.message && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {methods.formState.errors.issues.message}
              </Alert>
            )}
          </Stack>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="center" width={40}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issueFields.map((field, index) => {
                  const assignees = issueAssignees[field.id] || [];
                  const assigneeLabel = assignees
                    .map((a) => a?.name || a?.customerName)
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <TableRow key={field.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Field.AutocompleteFreeSolo
                          name={`issues.${index}.issue`}
                          label={`Issue ${index + 1}`}
                          options={WORK_ORDER_ISSUE_OPTIONS.map((option) => ({
                            label: option,
                            value: option,
                          }))}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <DialogSelectButton
                          onClick={() => {
                            setActiveIssueFieldId(field.id);
                            assigneeDialog.onTrue();
                          }}
                          selected={assigneeLabel || ''}
                          placeholder="Assign to..."
                          iconName={APP_ICONS.users}
                          iconNameSelected="mdi:account-multiple-check"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => {
                            removeIssue(index);
                            setIssueAssignees((prev) => {
                              const next = { ...prev };
                              delete next[field.id];
                              return next;
                            });
                          }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Card>
  );

  const renderLines = (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:cube-outline" width={20} />
            <Typography variant="h6">Parts</Typography>
          </Stack>
          <Button
            size="small"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() =>
              append({
                part: '',
                name: '',
                partLocation: locations?.length > 0 ? locations[0]._id : '',
                quantity: 1,
                price: 0,
              })
            }
          >
            Add Part
          </Button>
        </Stack>

        {isExternalWorkshop && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Note: Since this work order is categorized as &lsquo;External Workshop&rsquo;, inventory
            for attached parts will not be deducted.
          </Alert>
        )}

        {fields.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No parts added yet. Use &quot;Add Part&quot; to attach parts and pricing to this work
            order.
          </Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Part</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center" width={40}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const line = values.parts?.[index] || {};
                  const amount = (Number(line.quantity) || 0) * (Number(line.price) || 0);
                  const selectedPart = getLinePart(field.id, line.part);
                  const unit =
                    line.partSnapshot?.measurementUnit || selectedPart?.measurementUnit || '';

                  return (
                    <TableRow key={field.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        {(() => {
                          const snapshot = line.partSnapshot;
                          // If we have a snapshot, show it (historical)
                          // If we have a selected part, show it (live)
                          // If we have a custom name, show it (adhoc)

                          let label = '';
                          if (snapshot) {
                            label = `${snapshot.name}${snapshot.partNumber ? ` (${snapshot.partNumber})` : ''}`;
                          } else if (selectedPart) {
                            label = `${selectedPart.name}${selectedPart.partNumber ? ` (${selectedPart.partNumber})` : ''}`;
                          } else if (line.name) {
                            label = line.name;
                          }

                          return (
                            <Box>
                              <DialogSelectButton
                                onClick={() => {
                                  setActivePartLineId(field.id);
                                  partDialog.onTrue();
                                }}
                                selected={label}
                                placeholder="Select Part / Custom Item"
                                iconName={APP_ICONS.part}
                                iconNameSelected="mdi:cube-send"
                              />
                            </Box>
                          );
                        })()}
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        {/* Only show location if it's a real part */}
                        {!!line.part && (
                          <Field.Select
                            name={`parts.${index}.partLocation`}
                            label=""
                            InputLabelProps={{ shrink: true }}
                          >
                            <MenuItem value="" sx={{ display: 'none' }}>
                              Select Location
                            </MenuItem>
                            {locations.map((loc) => (
                              <MenuItem key={loc._id} value={loc._id}>
                                {loc.name}
                              </MenuItem>
                            ))}
                          </Field.Select>
                        )}
                        {!line.part && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block', px: 1 }}
                          >
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 100 }}>
                        <Field.Number
                          name={`parts.${index}.quantity`}
                          label="Qty"
                          inputProps={{ min: 1 }}
                          InputProps={{
                            endAdornment: unit ? (
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                {unit}
                              </Typography>
                            ) : undefined,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 140 }}>
                        <Field.Number
                          name={`parts.${index}.price`}
                          label="Price"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 120 }}>
                        <Typography variant="body2">{fCurrency(amount)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Card>
  );

  const renderSummary = (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:wallet-bold-duotone" width={24} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Summary
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Parts Cost
            </Typography>
            <Typography variant="subtitle2">{fCurrency(computed.partsCost)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Labour Charge
            </Typography>
            <Field.Number
              name="labourCharge"
              label=""
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Total Cost
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
              }}
            >
              {fCurrency(computed.total)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );

  const renderDescription = (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:document-text-bold-duotone" width={24} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Description / Notes
          </Typography>
        </Stack>
        <Field.Text
          name="description"
          multiline
          rows={6}
          placeholder="Describe the work to be carried out, key issues observed, or any additional notes..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.neutral',
            },
          }}
        />
      </Box>
    </Card>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {renderHeader}
        {renderIssues}
        {renderLines}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
            gap: 3,
          }}
        >
          {renderDescription}
          {renderSummary}
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(paths.dashboard.workOrder.list)}
        >
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {currentWorkOrder ? 'Save Changes' : 'Create Work Order'}
        </Button>
      </Stack>

      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        onlyOwn
        onlyActive
      />

      <KanbanContactsDialog
        open={assigneeDialog.value}
        onClose={assigneeDialog.onFalse}
        assignees={
          activeIssueFieldId && issueAssignees[activeIssueFieldId]
            ? issueAssignees[activeIssueFieldId]
            : []
        }
        onAssigneeChange={handleIssueAssigneesChange}
      />

      <KanbanPartsDialog
        open={partDialog.value}
        onClose={partDialog.onFalse}
        selectedPart={activeLineSelectedPart}
        onPartChange={handlePartChange}
      />

      <Menu anchorEl={priorityAnchorEl} open={priorityMenuOpen} onClose={handlePriorityMenuClose}>
        {WORK_ORDER_PRIORITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} onClick={() => handlePrioritySelect(option.value)}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor:
                    option.color === 'default'
                      ? 'text.disabled'
                      : (theme) => theme.palette[option.color]?.main || 'text.disabled',
                }}
              />
              <Typography variant="body2">{option.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={scheduledDateDialog.value}
        onClose={scheduledDateDialog.onFalse}
      >
        <DialogTitle>Select Scheduled Date</DialogTitle>
        <DialogContent dividers>
          <DateCalendar
            value={values.scheduledStartDate ? dayjs(values.scheduledStartDate) : null}
            onChange={handleScheduledDateChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => {
              setValue('scheduledStartDate', null, { shouldDirty: true, shouldValidate: true });
              scheduledDateDialog.onFalse();
            }}
          >
            Clear
          </Button>
          <Button variant="contained" onClick={scheduledDateDialog.onFalse}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={actualDateDialog.value}
        onClose={actualDateDialog.onFalse}
      >
        <DialogTitle>Select Actual Start Date</DialogTitle>
        <DialogContent dividers>
          <DateCalendar
            value={values.actualStartDate ? dayjs(values.actualStartDate) : null}
            onChange={handleActualDateChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => {
              setValue('actualStartDate', null, { shouldDirty: true, shouldValidate: true });
              actualDateDialog.onFalse();
            }}
          >
            Clear
          </Button>
          <Button variant="contained" onClick={actualDateDialog.onFalse}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
}
