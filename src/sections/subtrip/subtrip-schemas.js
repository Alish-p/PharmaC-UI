import { z as zod } from 'zod';

import { schemaHelper } from 'src/components/hook-form';

import { DRIVER_ADVANCE_GIVEN_BY_OPTIONS } from './constants';

const preprocessOptionalNumber = (schema) =>
  zod
    .union([zod.number(), zod.string(), zod.null(), zod.undefined()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? undefined : num;
    })
    .pipe(schema);

export const receiveSchema = zod
  .object({
    subtripId: zod.string().min(1, { message: 'Job is required' }),
    unloadingWeight: preprocessOptionalNumber(zod.number().optional()),
    endDate: schemaHelper.date({ message: { required_error: 'End date is required!' } }),
    commissionDetails: zod
      .object({
        commissionRate: preprocessOptionalNumber(
          zod.number().min(0, { message: 'Commission rate cannot be negative' }).optional()
        ),
        commissionAmount: preprocessOptionalNumber(
          zod.number().min(0, { message: 'Commission amount cannot be negative' }).optional()
        ),
      })
      .optional(),
    freightDetails: zod
      .object({
        freightAmount: preprocessOptionalNumber(zod.number().optional()),
        endKm: preprocessOptionalNumber(zod.number().optional()),
        endTime: schemaHelper.dateOptional({
          message: { invalid_type_error: 'Invalid End Time!' },
        }),
      })
      .optional(),
    hasError: zod.boolean().optional(),
    remarks: zod.string().optional(),
    errorRemarks: zod.string().optional(),
    shortageWeight: preprocessOptionalNumber(zod.number().optional()),
    shortageAmount: preprocessOptionalNumber(zod.number().optional()),
    hasShortage: zod.boolean().optional(),
    docs: zod.array(zod.any()).max(5, { message: 'Maximum 5 documents allowed' }).optional(),

    // Required for validation [not the actual fields]
    freightModel: zod.string().optional(),
    startKm: zod.number().optional(),
    loadingWeight: zod.number().optional(),
    isOwn: zod.boolean().optional(),
    unloadingWeightRequired: zod.boolean().optional(),
    remarksRequired: zod.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    const isUnloadingWeightRequired =
      values.freightModel === 'per_ton' ||
      values.freightModel === 'per_kl' ||
      values.unloadingWeightRequired === true;
    if (isUnloadingWeightRequired) {
      if (
        values.unloadingWeight === undefined ||
        values.unloadingWeight === null ||
        values.unloadingWeight <= 0
      ) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'Unloading weight is required',
          path: ['unloadingWeight'],
        });
      }
    }

    if (values.freightModel === 'per_km' || values.freightModel === 'hybrid') {
      const endKm = values.freightDetails?.endKm;
      if (endKm === undefined || endKm === null) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'End KM is required',
          path: ['freightDetails', 'endKm'],
        });
      } else if (values.startKm !== undefined && endKm < values.startKm) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `End KM must be ≥ Start KM (${values.startKm})`,
          path: ['freightDetails', 'endKm'],
        });
      }
    }

    if (values.hasShortage && (!values.shortageWeight || !values.shortageAmount)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Provide shortage details',
        path: ['shortageWeight'],
      });
    }

    if (values.hasError && !values.errorRemarks) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Error Remarks are required when error is reported',
        path: ['errorRemarks'],
      });
    }

    if (values.remarksRequired && !values.remarks) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Remarks are required',
        path: ['remarks'],
      });
    }
  });

// ----------------------------------------------------------------------
// Job Create Schemas & Defaults
// ----------------------------------------------------------------------

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

// Accept number-like values; coerce to number; treat empty/NaN as undefined
const numericInputSchema = zod.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}, zod.number().optional());

// Loading weight: 0 or more
const loadingWeightSchema = zod.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) ? n : undefined;
  },
  zod.number().min(0, { message: 'Loading weight must be at least 0' }).optional()
);

const consigneeOptionSchema = zod
  .object({ label: zod.string().optional(), value: zod.string().optional() })
  .partial()
  .nullish();

export const jobCreateSchema = zod
  .object({
    diNumber: zod.string().optional(),
    remarks: zod.string().optional(),
    startDate: schemaHelper.date({
      message: {
        required_error: 'Start date is required!',
        invalid_type_error: 'Invalid Start Date!',
      },
    }),
    tripDecision: zod.enum(['attach', 'new']),
    tripId: zod.string().optional(),
    loadType: zod.enum(['loaded', 'empty']),
    startKm: numericInputSchema,
    consignee: consigneeOptionSchema,
    loadingPoint: zod.string().optional(),
    unloadingPoint: zod
      .union([zod.string(), zod.array(zod.object({ label: zod.string(), value: zod.string() }))])
      .nullable()
      .optional(),
    loadingWeight: loadingWeightSchema,
    freightModel: zod
      .enum(['per_ton', 'per_kl', 'fixed', 'per_km', 'per_hour', 'hybrid'])
      .optional(),
    freightAmount: numericInputSchema,
    baseKm: numericInputSchema,
    rate: numericInputSchema,
    freightStartKm: numericInputSchema,
    invoiceNo: zod.string().optional(),
    ewayBill: zod.string().optional(),
    // Optional because empty subtrips won't have it
    ewayExpiryDate: schemaHelper.dateOptional({
      message: { invalid_type_error: 'Invalid Eway Expiry Date!' },
    }),
    materialType: zod.string().optional(),
    quantity: numericInputSchema,
    grade: zod.string().optional(),
    shipmentNo: zod.string().optional(),
    orderNo: zod.string().optional(),
    referenceSubtripNo: zod.string().optional(),
    vehicleAssignment: zod.enum(['schedule', 'adhock']).optional(),
    driverAdvance: numericInputSchema,
    driverAdvanceGivenBy: zod.string().optional(),
    initialAdvanceDiesel: numericInputSchema,
    initialAdvanceDieselUnit: zod.enum(['litre', 'amount']).optional(),
    pumpCd: zod.string().optional(),
  })
  .superRefine((data, ctx) => {
    const dieselAdvance = toNumber(data.initialAdvanceDiesel);
    const requiresPump =
      data.driverAdvanceGivenBy === DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP ||
      (dieselAdvance !== undefined && dieselAdvance > 0);

    if (requiresPump && !data.pumpCd) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Pump selection is required when advance or diesel is provided by the pump',
        path: ['pumpCd'],
      });
    }

    if (data.loadType === 'loaded') {
      if (data.freightModel === 'per_km' || data.freightModel === 'hybrid') {
        if (data.freightStartKm === undefined || data.freightStartKm === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Billing Start KM is required',
            path: ['freightStartKm'],
          });
        }
      }

      if (data.freightModel === 'per_ton' || data.freightModel === 'per_kl') {
        if (data.loadingWeight === undefined || data.loadingWeight === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Loading weight is required for Per Ton / Per KL model',
            path: ['loadingWeight'],
          });
        }
      }

      if (data.freightModel === 'fixed') {
        if (data.freightAmount === undefined || data.freightAmount === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Freight amount is required',
            path: ['freightAmount'],
          });
        }
      } else if (data.freightModel === 'hybrid') {
        if (data.freightAmount === undefined || data.freightAmount === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Base freight amount is required',
            path: ['freightAmount'],
          });
        }
        if (data.baseKm === undefined || data.baseKm === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Base KM is required',
            path: ['baseKm'],
          });
        }
        if (data.rate === undefined || data.rate === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Extra rate per KM is required',
            path: ['rate'],
          });
        }
      } else if (data.rate === undefined || data.rate === null) {
        // per_ton, per_km, per_hour
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'Rate is required',
          path: ['rate'],
        });
      }
    }
  });

export const createJobDefaultValues = () => ({
  diNumber: '',
  remarks: '',
  startDate: new Date(),
  tripDecision: 'attach',
  loadType: 'loaded',
  startKm: '',
  consignee: null,
  vehicleAssignment: 'schedule',
  loadingPoint: '',
  unloadingPoint: [],
  loadingWeight: '',
  freightModel: 'per_ton',
  freightAmount: '',
  baseKm: '',
  rate: '',
  freightStartKm: '',
  invoiceNo: '',
  ewayBill: '',
  ewayExpiryDate: null,
  materialType: '',
  quantity: '',
  grade: '',
  shipmentNo: '',
  orderNo: '',
  referenceSubtripNo: '',
  driverAdvance: '',
  driverAdvanceGivenBy: DRIVER_ADVANCE_GIVEN_BY_OPTIONS.SELF,
  initialAdvanceDiesel: '',
  initialAdvanceDieselUnit: 'litre',
  pumpCd: '',
});
