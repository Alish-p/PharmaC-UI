import dayjs from 'dayjs';
import { z as zod } from 'zod';

// ----------------------------------------------------------------------
// Regex Patterns
// ----------------------------------------------------------------------
const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;
const PAN_REGEX = /^[A-Z]{3}[CPHFATBLJG][A-Z][0-9]{4}[A-Z]$/i;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

// ----------------------------------------------------------------------
// Main schemaHelper Export
// ----------------------------------------------------------------------
export const schemaHelper = {
  // =========================================================================
  // 1. PHONE NUMBER VALIDATORS
  //    - phoneNumber: required, must be exactly 10 digits
  //    - phoneNumberOptional: optional or blank, but if present must be 10 digits
  // =========================================================================
  phoneNumber: (props) =>
    zod
      .string()
      .min(1, {
        message: props?.message?.required_error ?? 'Phone number is required',
      })
      .regex(PHONE_REGEX, {
        message: props?.message?.invalid_error ?? 'Phone number must be exactly 10 digits',
      }),

  phoneNumberOptional: (props) =>
    zod
      .string()
      .optional()
      .refine(
        (val) => {
          // If undefined or empty string, it's fine. Otherwise, must match PHONE_REGEX.
          if (val === undefined || val === '') return true;
          return PHONE_REGEX.test(val);
        },
        {
          message: props?.message?.invalid_error ?? 'Phone number must be exactly 10 digits',
        }
      ),

  // =========================================================================
  // 2. PIN CODE VALIDATORS
  //    - pinCode: required, must be exactly 6 digits
  //    - pinCodeOptional: optional or blank, but if present must be 6 digits
  // =========================================================================
  pinCode: (props) =>
    zod
      .string()
      .min(1, {
        message: props?.message?.required_error ?? 'Pin Code is required',
      })
      .regex(PINCODE_REGEX, {
        message: props?.message?.invalid_error ?? 'Pin Code must be exactly 6 digits',
      }),

  pinCodeOptional: (props) =>
    zod
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === '') return true;
          return PINCODE_REGEX.test(val);
        },
        {
          message: props?.message?.invalid_error ?? 'Pin Code must be exactly 6 digits',
        }
      ),

  // =========================================================================
  // 3. ACCOUNT NUMBER VALIDATOR
  //    - accountNumber: required, must be between 9 and 18 digits
  // =========================================================================
  accountNumber: (props) =>
    zod
      .string()
      .min(1, {
        message: props?.message?.required_error ?? 'Account number is required',
      })
      .regex(ACCOUNT_NUMBER_REGEX, {
        message: props?.message?.invalid_error ?? 'Account number must be between 9 and 18 digits',
      }),

  accountNumberOptional: (props) =>
    zod
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === '') return true;
          return ACCOUNT_NUMBER_REGEX.test(val);
        },
        {
          message:
            props?.message?.invalid_error ?? 'Account number must be between 9 and 18 digits',
        }
      ),

  // =========================================================================
  // 4. PAN NUMBER VALIDATORS
  //    - panNumber: required, must follow PAN format
  //    - panNumberOptional: optional or blank, but if present must follow PAN format
  // =========================================================================
  panNumber: (props) =>
    zod
      .string()
      .min(1, {
        message: props?.message?.required_error ?? 'PAN number is required',
      })
      .regex(PAN_REGEX, {
        message: props?.message?.invalid_error ?? 'PAN number must be a valid 10-character PAN',
      }),

  panNumberOptional: (props) =>
    zod
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === '') return true;
          return PAN_REGEX.test(val);
        },
        {
          message: props?.message?.invalid_error ?? 'PAN number must be a valid 10-character PAN',
        }
      ),

  // =========================================================================
  // 5. GST NUMBER VALIDATORS
  //    - gstNumber: required, must follow GSTIN format
  //    - gstNumberOptional: optional or blank, but if present must follow GSTIN format
  // =========================================================================
  gstNumber: (props) =>
    zod
      .string()
      .min(1, {
        message: props?.message?.required_error ?? 'GST number is required',
      })
      .regex(GST_REGEX, {
        message: props?.message?.invalid_error ?? 'GST number must be a valid 15-character GSTIN',
      }),

  gstNumberOptional: (props) =>
    zod
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === '') return true;
          return GST_REGEX.test(val);
        },
        {
          message: props?.message?.invalid_error ?? 'GST number must be a valid 15-character GSTIN',
        }
      ),

  // =========================================================================
  // 6. DATE VALIDATOR
  //    - Coerces input into a Date, checks for required and invalid date cases
  // =========================================================================
  date: (props) =>
    zod.coerce
      .date()
      .nullable()
      .transform((dateString, ctx) => {
        // Format using dayjs (to enforce a consistent string format internally)
        const formatted = dayjs(dateString).format();

        // A quick check: if dateString is falsy, it's considered missing
        if (!dateString) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: props?.message?.required_error ?? 'Date is required!',
          });
          return null;
        }

        // Try to parse the formatted string back to a Date
        const parsed = zod.string().pipe(zod.coerce.date());
        if (!parsed.safeParse(formatted).success) {
          ctx.addIssue({
            code: zod.ZodIssueCode.invalid_date,
            message: props?.message?.invalid_type_error ?? 'Invalid Date!',
          });
          return null;
        }

        return formatted;
      })
      .pipe(zod.union([zod.number(), zod.string(), zod.date(), zod.null()])),

  // =========================================================================
  // 6b. OPTIONAL DATE VALIDATOR
  //     - Allows undefined/null/blank without error
  //     - If present, coerces to Date and validates
  //     - Returns formatted date string (consistent with `date`)
  // =========================================================================
  dateOptional: (props) =>
    zod.union([
      zod.undefined(),
      zod.null(),
      zod.literal(''),
      zod.coerce.date().transform((dateVal, ctx) => {
        const formatted = dayjs(dateVal).format();
        const parsed = zod.string().pipe(zod.coerce.date());
        if (!parsed.safeParse(formatted).success) {
          ctx.addIssue({
            code: zod.ZodIssueCode.invalid_date,
            message: props?.message?.invalid_type_error ?? 'Invalid Date!',
          });
          return undefined;
        }
        return formatted;
      }),
    ]),

  // =========================================================================
  // 7. TEXT FIELD VALIDATORS
  //    - editor: string with minimum length (e.g., for rich-text editors)
  // =========================================================================
  editor: (props) =>
    zod.string().min(8, {
      message: props?.message?.required_error ?? 'Editor is required!',
    }),

  // =========================================================================
  // 8. OBJECT-OR-NULL VALIDATOR
  //    - objectOrNull: ensures data is neither null nor empty string
  // =========================================================================
  objectOrNull: (props) =>
    zod
      .custom()
      .refine((data) => data !== null, {
        message: props?.message?.required_error ?? 'Field is required!',
      })
      .refine((data) => data !== '', {
        message: props?.message?.required_error ?? 'Field is required!',
      }),

  // =========================================================================
  // 9. BOOLEAN VALIDATOR
  //    - boolean: coerces to boolean, then requires it to be true
  // =========================================================================
  boolean: (props) =>
    zod.coerce.boolean().refine((bool) => bool === true, {
      message: props?.message?.required_error ?? 'Switch is required!',
    }),

  // =========================================================================
  // 10. FILE(S) VALIDATORS
  //    - file: single file required
  //    - files: array of files, with a minimum length requirement (default 2)
  // =========================================================================
  file: (props) =>
    zod.custom().transform((data, ctx) => {
      const hasFile = data instanceof File || (typeof data === 'string' && !!data.length);
      if (!hasFile) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.required_error ?? 'File is required!',
        });
        return null;
      }
      return data;
    }),

  files: (props) =>
    zod.array(zod.custom()).transform((data, ctx) => {
      const minFiles = props?.minFiles ?? 2;
      if (!data.length) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.required_error ?? 'Files are required!',
        });
      } else if (data.length < minFiles) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `Must have at least ${minFiles} items!`,
        });
      }
      return data;
    }),
};
