import { Box, Alert } from '@mui/material';

import useExpenseInsights from './useExpenseInsights';

function ExpenseInsights({ subtrip, expenseType }) {
  const { alertContent } = useExpenseInsights(subtrip);

  return (
    <Box>
      {(alertContent[expenseType] || []).map((message, idx) => (
        <Alert key={idx} severity="info" variant="outlined" sx={{ my: 2 }}>
          {message}
        </Alert>
      ))}
    </Box>
  );
}

export default ExpenseInsights;
