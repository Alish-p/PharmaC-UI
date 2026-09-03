export const BORROWER_TYPES = [
  { key: 'Driver', label: 'Driver' },
  { key: 'Transporter', label: 'Transporter' },
];

export const LOAN_REASONS = {
  Driver: [
    { label: 'Personal Loan', value: 'Personal Loan' },
    { label: 'Advance Agaist Salary', value: 'Advance Agaist Salary' },
  ],
  Transporter: [
    { label: 'Personal Loan', value: 'Personal Loan' },
    { label: 'Tyre Loan', value: 'Tyre Loan' },
    { label: 'Maintenance Loan', value: 'Maintenance Loan' },
    { label: 'GPS Device Loan', value: 'GPS Device Loan' },
  ],
};

export const LOAN_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
};

export const LOAN_STATUS_COLOR = {
  active: 'warning',
  closed: 'success',
};
