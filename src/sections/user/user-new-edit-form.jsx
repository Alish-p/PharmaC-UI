import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import {
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Tooltip,
  Divider,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSystemFeatures } from 'src/hooks/use-system-features';

import { fData } from 'src/utils/format-number';

import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useTenantContext } from 'src/auth/tenant';

import { ACTIONS, PERMISSIONS } from './config';
import { useCreateUser, useUpdateUser } from '../../query/use-user';

// ----------------------------------------------------------------------

// User Schema Validation
export const UserSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Invalid email address!' }),
  mobile: schemaHelper.phoneNumber({
    message: {
      required_error: 'Mobile No is required',
      invalid_error: 'Mobile No must be exactly 10 digits',
    },
  }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  designation: zod.string().min(1, { message: 'Designation is required!' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long!' }),

  permissions: zod.object(
    Object.fromEntries(
      PERMISSIONS.map(({ name }) => [
        name,
        zod.object(Object.fromEntries(ACTIONS.map((action) => [action, zod.boolean()]))),
      ])
    )
  ),
});

// ----------------------------------------------------------------------

export function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      mobile: currentUser?.mobile || '',
      address: currentUser?.address || '',
      password: currentUser?.password || '',
      designation: currentUser?.designation || '',

      permissions: Object.fromEntries(
        PERMISSIONS.map(({ name }) => [
          name,
          Object.fromEntries(
            ACTIONS.map((action) => [action, currentUser?.permissions?.[name]?.[action] || false])
          ),
        ])
      ),
    }),
    [currentUser]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(UserSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const tenant = useTenantContext();
  const { vehicleMode, pumps } = useSystemFeatures();

  const filteredPermissions = useMemo(
    () =>
      PERMISSIONS.filter((perm) => {
        if (vehicleMode === VEHICLE_MODES.OWN_ONLY && (perm.name === 'transporter' || perm.name === 'transporterPayment'))
          return false;
        if (!pumps && perm.name === 'pump') return false;
        if (!tenant?.integrations?.tyre?.enabled && perm.group === 'Tyre Management') return false;
        if (
          !tenant?.integrations?.maintenanceAndInventory?.enabled &&
          perm.group === 'Vehicle Maintenance'
        )
          return false;
        return true;
      }),
    [vehicleMode, pumps, tenant]
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const group = permission.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {});

  const getCheckedStatus = (action) => {
    if (filteredPermissions.length === 0) return { all: false, some: false };
    const all = filteredPermissions.every((item) => values.permissions?.[item.name]?.[action]);
    const some = filteredPermissions.some((item) => values.permissions?.[item.name]?.[action]);
    return { all, some };
  };

  const getGroupCheckedStatus = (group, action) => {
    const groupPerms = groupedPermissions[group];
    const all = groupPerms.every((item) => values.permissions?.[item.name]?.[action]);
    const some = groupPerms.some((item) => values.permissions?.[item.name]?.[action]);
    return { all, some };
  };

  const handleGroupToggle = (group, action, checked) => {
    groupedPermissions[group].forEach((item) => {
      setValue(`permissions.${item.name}.${action}`, checked);
    });
  };

  const applyPreset = (preset) => {
    filteredPermissions.forEach((item) => {
      switch (preset) {
        case 'admin':
          ACTIONS.forEach((action) => {
            setValue(`permissions.${item.name}.${action}`, true);
          });
          break;
        case 'editor':
          setValue(`permissions.${item.name}.create`, true);
          setValue(`permissions.${item.name}.view`, true);
          setValue(`permissions.${item.name}.update`, true);
          setValue(`permissions.${item.name}.delete`, false);
          break;
        case 'viewer':
          setValue(`permissions.${item.name}.create`, false);
          setValue(`permissions.${item.name}.view`, true);
          setValue(`permissions.${item.name}.update`, false);
          setValue(`permissions.${item.name}.delete`, false);
          break;
        case 'clear':
          ACTIONS.forEach((action) => {
            setValue(`permissions.${item.name}.${action}`, false);
          });
          break;
        default:
          break;
      }
    });
  };

  const getPermissionCount = () => {
    let count = 0;
    filteredPermissions.forEach((item) => {
      ACTIONS.forEach((action) => {
        if (values.permissions?.[item.name]?.[action]) {
          count += 1;
        }
      });
    });
    return count;
  };

  const TABLE_HEAD = [
    { id: 'module', label: 'Module' },
    ...ACTIONS.map((action) => {
      const { all, some } = getCheckedStatus(action);
      return {
        id: action,
        label: (
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Checkbox
              size="small"
              checked={all}
              indeterminate={some && !all}
              onChange={(event) => {
                filteredPermissions.forEach((item) => {
                  setValue(`permissions.${item.name}.${action}`, event.target.checked);
                });
              }}
            />
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Stack>
        ),
        align: 'center',
      };
    }),
  ];

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentUser) {
        await updateUser({ id: currentUser._id, data });
      } else {
        await createUser(data);
      }
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label color="warning" sx={{ position: 'absolute', top: 24, right: 24 }}>
                active
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Text name="name" label="Full name" />
              <Field.Text name="email" label="Email address" />
              <Field.Text
                name="mobile"
                label="Mobile number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91 - </InputAdornment>,
                }}
              />
              <Field.Text name="address" label="Address" />
              <Field.Text name="designation" label="Designation" />
              <Field.Text
                name="password"
                label="Password"
                helperText="This is a temporary password. The user must change it after logging in."
              />
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3, mt: 3 }}>
            <Stack spacing={3}>
              {/* Header Section */}
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      User Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure access rights for this user across different modules
                    </Typography>
                  </Box>
                  <Chip
                    label={`${getPermissionCount()} permissions granted`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Stack>

                {/* Quick Preset Buttons */}
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Tooltip title="Grant all permissions (full access)">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:shield-crown" />}
                      onClick={() => applyPreset('admin')}
                      color="error"
                    >
                      Admin Access
                    </Button>
                  </Tooltip>
                  <Tooltip title="Grant create, view, and update permissions">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:pencil" />}
                      onClick={() => applyPreset('editor')}
                      color="warning"
                    >
                      Editor Access
                    </Button>
                  </Tooltip>
                  <Tooltip title="Grant view-only permissions">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:eye" />}
                      onClick={() => applyPreset('viewer')}
                      color="info"
                    >
                      Viewer Access
                    </Button>
                  </Tooltip>
                  <Tooltip title="Remove all permissions">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:close-circle" />}
                      onClick={() => applyPreset('clear')}
                      color="inherit"
                    >
                      Clear All
                    </Button>
                  </Tooltip>
                </Stack>

                <Alert severity="info" icon={<Iconify icon="mdi:information" />}>
                  <strong>Tip:</strong> Use column checkboxes to quickly assign permissions across
                  all modules, or use group checkboxes for section-specific access.
                </Alert>
              </Stack>

              <Divider />

              {/* Permissions Table */}
              <Scrollbar>
                <Table sx={{ minWidth: 800 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />

                  <TableBody>
                    {Object.keys(groupedPermissions).map((group) => {
                      const groupIcon =
                        {
                          Management: 'mdi:cog',
                          Billing: 'mdi:currency-usd',
                          'Vehicle Maintenance': 'mdi:car-wrench',
                          'Tyre Management': 'mingcute:tyre-line',
                        }[group] || 'mdi:folder';

                      return (
                        <>
                          <TableRow
                            key={group}
                            sx={{
                              bgcolor: 'background.neutral',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify icon={groupIcon} width={20} />
                                <Typography variant="subtitle1" fontWeight="600">
                                  {group}
                                </Typography>
                              </Stack>
                            </TableCell>
                            {ACTIONS.map((action) => {
                              const { all, some } = getGroupCheckedStatus(group, action);
                              return (
                                <TableCell key={action} align="center">
                                  <Tooltip title={`Toggle ${action} for all ${group} modules`}>
                                    <Checkbox
                                      size="small"
                                      checked={all}
                                      indeterminate={some && !all}
                                      onChange={(e) =>
                                        handleGroupToggle(group, action, e.target.checked)
                                      }
                                      sx={{
                                        color: 'primary.main',
                                        '&.Mui-checked': { color: 'primary.main' },
                                      }}
                                    />
                                  </Tooltip>
                                </TableCell>
                              );
                            })}
                          </TableRow>

                          {groupedPermissions[group].map((permission) => (
                            <TableRow
                              key={permission.name}
                              sx={{
                                '&:hover': { bgcolor: 'action.hover' },
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <TableCell>
                                <ListItemText
                                  primary={permission.subheader}
                                  secondary={permission.caption}
                                  primaryTypographyProps={{
                                    typography: 'body2',
                                    fontWeight: 500,
                                    mb: 0.25,
                                  }}
                                  secondaryTypographyProps={{
                                    component: 'span',
                                    sx: {
                                      typography: 'caption',
                                      color: 'text.secondary',
                                      display: 'block',
                                      mt: 0.5,
                                    },
                                  }}
                                />
                              </TableCell>
                              {ACTIONS.map((action) => (
                                <TableCell key={action} align="center">
                                  <Field.Checkbox
                                    name={`permissions.${permission.name}.${action}`}
                                    label=""
                                    sx={{ m: 0 }}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </Scrollbar>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={12}>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentUser ? 'Create user' : 'Save changes'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
}
