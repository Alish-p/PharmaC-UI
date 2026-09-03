import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function ExpenseDetailView({ expense }) {
  const [tabValue, setTabValue] = useState('details');

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const {
    _id,
    tripId,
    subtripId,
    vehicleId,
    date,
    expenseCategory,
    expenseType,
    installment,
    amount,
    slipNo,
    pumpCd,
    remarks,
    fuelLtr,
    fuelRate,
    paidThrough,
    authorisedBy,
  } = expense || {};

  const detailsMarkdown = `
[](/)
**Expense ID:** ${_id}  
**Date:** ${fDate(date)}  

---

### Expense Information

| Attribute              | Details                  |
| :--------------------- | :----------------------- |
| **Expense Category**   | ${expenseCategory}       |
| **Expense Type**       | ${expenseType}           |
| **Installment**        | ${installment || 'N/A'}  |
| **Amount**             | ${amount}               |
| **Slip Number**        | ${slipNo || 'N/A'}       |
| **Remarks**            | ${remarks || 'N/A'}      |

---

### Fuel Information

| Attribute              | Details                  |
| :--------------------- | :----------------------- |
| **Fuel Liters**        | ${fuelLtr || 'N/A'}      |
| **Fuel Rate**          | ${fuelRate || 'N/A'}     |

---

### Payment Information

| Attribute              | Details                  |
| :--------------------- | :----------------------- |
| **Paid Through**       | ${paidThrough || 'N/A'}  |
| **Authorised By**      | ${authorisedBy || 'N/A'} |

---

### Related Entities

| Attribute              | Details                  |
| :--------------------- | :----------------------- |
| **Trip ID**            | ${tripId || 'N/A'}       |
| **Subtrip**            | ${subtripId || 'N/A'}    |
| **Vehicle ID**         | ${vehicleId || 'N/A'}    |
| **Pump**          | ${pumpCd || 'N/A'}       |

`;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Expense Info"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Expenses List', href: paths.dashboard.expense.root },
          { name: `${_id}` },
        ]}
        sx={{ my: { xs: 3, md: 5 } }}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.expense.edit(expense._id)}
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Expense
          </Button>
        }
      />
      <Card>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            px: 3,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.grey['500Channel']}`,
          }}
        >
          <Tab value="details" label="Expense Details" />
        </Tabs>

        {tabValue === 'details' && (
          <Box sx={{ p: 3 }}>
            <Markdown children={detailsMarkdown} />
          </Box>
        )}
      </Card>
    </DashboardContent>
  );
}
