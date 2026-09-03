import { AppInvoiceAmountSummary } from 'src/sections/overview/app/app-invoice-amount-summary';

export function CustomerInvoiceAmountSummaryWidget({ customer }) {
  const { _id: customerId } = customer || {};

  return <AppInvoiceAmountSummary customerId={customerId} />;
}

export default CustomerInvoiceAmountSummaryWidget;
