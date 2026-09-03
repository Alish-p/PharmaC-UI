export const PERMISSIONS = [
  {
    subheader: 'Customer',
    caption:
      'Permissions for accessing, modifying, and managing customer profiles and interactions.',
    name: 'customer',
    group: 'Management',
  },
  {
    subheader: 'Driver',
    caption:
      'Permissions for handling driver records, assignments, salaries, and trip allocations.',
    name: 'driver',
    group: 'Management',
  },
  {
    subheader: 'Driver Salary',
    caption: 'Permissions for managing driver salaries, payments, and salary records.',
    name: 'driverSalary',
    group: 'Billing',
  },
  {
    subheader: 'Expense',
    caption: 'Permissions for tracking, managing, and approving company expenses.',
    name: 'expense',
    group: 'Management',
  },
  {
    subheader: 'Invoice',
    caption: 'Permissions to create, modify, and manage invoices related to trips and services.',
    name: 'invoice',
    group: 'Billing',
  },
  {
    subheader: 'Loan',
    caption:
      'Permissions related to handling loan records, repayment tracking, and financial obligations.',
    name: 'loan',
    group: 'Billing',
  },
  {
    subheader: 'Pump',
    caption: 'Permissions for managing fuel pumps, allocations, and fuel purchase records.',
    name: 'pump',
    group: 'Management',
  },

  {
    subheader: 'Jobs',
    caption: 'Permissions for managing and tracking jobs as part of larger trip assignments.',
    name: 'subtrip',
    group: 'Management',
  },
  {
    subheader: 'Transporter',
    caption: 'Permissions for managing transporter details, assignments, and operations.',
    name: 'transporter',
    group: 'Management',
  },
  {
    subheader: 'Transporter Payment',
    caption: 'Permissions related to handling transporter payments, invoices, and settlements.',
    name: 'transporterPayment',
    group: 'Billing',
  },
  {
    subheader: 'Trip',
    caption:
      'Permissions to create, edit, and monitor trips, including route planning and trip statuses.',
    name: 'trip',
    group: 'Management',
  },
  {
    subheader: 'User',
    caption: 'Permissions for managing user accounts, roles, and access control within the system.',
    name: 'user',
    group: 'Management',
  },
  {
    subheader: 'Vehicle',
    caption:
      'Permissions related to vehicle registration, maintenance, tracking, and fuel consumption monitoring.',
    name: 'vehicle',
    group: 'Management',
  },
  {
    subheader: 'Parts',
    caption: 'Permissions for managing vehicle spare parts, including inventory and pricing.',
    name: 'part',
    group: 'Vehicle Maintenance',
  },
  {
    subheader: 'Part Locations',
    caption: 'Permissions for managing part storage locations such as warehouses or godowns.',
    name: 'partLocation',
    group: 'Vehicle Maintenance',
  },
  {
    subheader: 'Vendors',
    caption: 'Permissions for managing vendors, including contact details and bank information.',
    name: 'vendor',
    group: 'Vehicle Maintenance',
  },
  {
    subheader: 'Purchase Orders',
    caption:
      'Permissions for creating and managing purchase orders for vehicle parts and inventory.',
    name: 'purchaseOrder',
    group: 'Vehicle Maintenance',
  },
  {
    subheader: 'Work Orders',
    caption: 'Permissions for creating and managing vehicle maintenance work orders.',
    name: 'workOrder',
    group: 'Vehicle Maintenance',
  },
  {
    subheader: 'Tyre Management',
    caption: 'Permissions for managing tyres, including stock, mounting, and history.',
    name: 'tyre',
    group: 'Tyre Management',
  },
];

export const ACTIONS = ['create', 'view', 'update', 'delete'];
