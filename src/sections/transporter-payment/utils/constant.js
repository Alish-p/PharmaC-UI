export const TRANSPORTER_PAYMENT_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'generated', label: 'Generated' },
];

export const TRANSPORTER_PAYMENT_STATUS_COLORS = {
  all: 'default',
  generated: 'info',
  paid: 'success',
  cancelled: 'error',
};

export const getTransporterPaymentStatusColor = (status) =>
  TRANSPORTER_PAYMENT_STATUS_COLORS[status] || 'default';
