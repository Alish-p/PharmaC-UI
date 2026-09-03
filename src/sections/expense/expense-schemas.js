import dayjs from 'dayjs';
import { z as zod } from 'zod';

import { schemaHelper } from 'src/components/hook-form';

export const SubtripExpenseSchema = zod
  .object({
    date: schemaHelper.date({ message: { required_error: 'Date is required!' } }),
    expenseType: zod.string({ required_error: 'Expense Type is required' }),
    subtripId: zod.string({ required_error: 'Job is required' }),
    amount: zod.number().min(1, { message: 'Amount must be a positive number' }),
    pumpCd: zod.string().optional(),
    dieselLtr: zod.number().optional(),
    dieselPrice: zod.number().optional(),
    remarks: zod.string().optional(),
    paidThrough: zod.string().optional(),
    fixedSalary: zod.number().optional(),
    variableSalary: zod.number().optional(),
    performanceSalary: zod.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.date && dayjs(data.date).isAfter(dayjs(), 'day')) {
      ctx.addIssue({ path: ['date'], message: 'Expense date cannot be in the future' });
    }
    if (data.expenseType === 'Diesel') {
      if (!data.dieselLtr || data.dieselLtr <= 0) {
        ctx.addIssue({ path: ['dieselLtr'], message: 'Diesel Liters must be a positive Number' });
      }
      if (!data.dieselPrice || data.dieselPrice <= 0) {
        ctx.addIssue({ path: ['dieselPrice'], message: 'Per Litre Diesel Price must be positive' });
      }
    }
  });

