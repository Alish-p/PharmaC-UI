import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _carouselsMembers = [...Array(6)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  role: _mock.role(index),
  avatarUrl: _mock.image.portrait(index),
}));

// ----------------------------------------------------------------------

export const _faqs = [...Array(8)].map((_, index) => ({
  id: _mock.id(index),
  value: `panel${index + 1}`,
  heading: `Questions ${index + 1}`,
  detail: _mock.description(index),
}));

// ----------------------------------------------------------------------

export const _addressBooks = [...Array(24)].map((_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  email: _mock.email(index + 1),
  fullAddress: _mock.fullAddress(index),
  phoneNumber: _mock.phoneNumber(index),
  company: _mock.companyNames(index + 1),
  addressType: index === 0 ? 'Home' : 'Office',
}));

// ----------------------------------------------------------------------

export const _contacts = [...Array(20)].map((_, index) => {
  const status =
    (index % 2 && 'online') || (index % 3 && 'offline') || (index % 4 && 'alway') || 'busy';

  return {
    id: _mock.id(index),
    status,
    role: _mock.role(index),
    email: _mock.email(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
    lastActivity: _mock.time(index),
    avatarUrl: _mock.image.avatar(index),
    address: _mock.fullAddress(index),
  };
});

// ----------------------------------------------------------------------

export const _notifications = [...Array(9)].map((_, index) => ({
  id: _mock.id(index),
  avatarUrl: [
    _mock.image.avatar(1),
    _mock.image.avatar(2),
    _mock.image.avatar(3),
    _mock.image.avatar(4),
    _mock.image.avatar(5),
    null,
    null,
    null,
    null,
    null,
  ][index],
  type: ['friend', 'project', 'file', 'tags', 'payment', 'order', 'chat', 'mail', 'delivery'][
    index
  ],
  category: [
    'Communication',
    'Project UI',
    'File manager',
    'File manager',
    'File manager',
    'Order',
    'Order',
    'Communication',
    'Communication',
  ][index],
  isUnRead: _mock.boolean(index),
  createdAt: _mock.time(index),
  title:
    (index === 0 && `<p><strong>Deja Brady</strong> sent you a friend request</p>`) ||
    (index === 1 &&
      `<p><strong>Jayvon Hull</strong> mentioned you in <strong><a href='#'>Tranzit UI</a></strong></p>`) ||
    (index === 2 &&
      `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File manager</a></strong></p>`) ||
    (index === 3 &&
      `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File manager<a/></strong></p>`) ||
    (index === 4 &&
      `<p><strong>Giana Brandt</strong> request a payment of <strong>$200</strong></p>`) ||
    (index === 5 && `<p>Your order is placed waiting for shipping</p>`) ||
    (index === 6 && `<p>Delivery processing your order is being shipped</p>`) ||
    (index === 7 && `<p>You have new message 5 unread messages</p>`) ||
    (index === 8 && `<p>You have new mail`) ||
    '',
}));

// ----------------------------------------------------------------------

export const _mapContact = [
  {
    latlng: [33, 65],
    address: _mock.fullAddress(1),
    phoneNumber: _mock.phoneNumber(1),
  },
  {
    latlng: [-12.5, 18.5],
    address: _mock.fullAddress(2),
    phoneNumber: _mock.phoneNumber(2),
  },
];

// ----------------------------------------------------------------------

export const _socials = [
  {
    value: 'facebook',
    name: 'Facebook',
    path: 'https://www.facebook.com/caitlyn.kerluke',
  },
  {
    value: 'instagram',
    name: 'Instagram',
    path: 'https://www.instagram.com/caitlyn.kerluke',
  },
  {
    value: 'linkedin',
    name: 'Linkedin',
    path: 'https://www.linkedin.com/caitlyn.kerluke',
  },
  {
    value: 'twitter',
    name: 'Twitter',
    path: 'https://www.twitter.com/caitlyn.kerluke',
  },
];

// ----------------------------------------------------------------------

export const _pricingPlans = [
  {
    subscription: 'basic',
    price: 200,
    caption: 'Essential fleet management',
    lists: [
      { text: 'Trip & Subtrip Management', enabled: true },
      { text: 'Driver & Salary Management', enabled: true },
      { text: 'Customer Invoicing', enabled: true },
      { text: 'Transporter Payments', enabled: true },
      { text: 'Vehicle Expenses', enabled: true },
      { text: 'Reports & Analytics', enabled: true },
      { text: 'WhatsApp Notifications', enabled: false },
      { text: 'Vehicle GPS Tracking', enabled: false },
      { text: 'E-Way Bill Integration', enabled: false },
      { text: 'eChallan Tracking', enabled: false },
      { text: 'GST / Vehicle API', enabled: false },
      { text: 'Maintenance & Inventory', enabled: false },
      { text: 'Tyre Management', enabled: false },
      { text: 'Accounting (Tally / Zoho)', enabled: false },
    ],
    labelAction: 'Get started',
  },
  {
    subscription: 'standard',
    price: 400,
    caption: 'Best for growing fleets',
    lists: [
      { text: 'Trip & Subtrip Management', enabled: true },
      { text: 'Driver & Salary Management', enabled: true },
      { text: 'Customer Invoicing', enabled: true },
      { text: 'Transporter Payments', enabled: true },
      { text: 'Vehicle Expenses', enabled: true },
      { text: 'Reports & Analytics', enabled: true },
      { text: 'WhatsApp Notifications', enabled: true },
      { text: 'Vehicle GPS Tracking', enabled: true },
      { text: 'E-Way Bill Integration', enabled: true },
      { text: 'eChallan Tracking', enabled: false },
      { text: 'GST / Vehicle API', enabled: false },
      { text: 'Maintenance & Inventory', enabled: false },
      { text: 'Tyre Management', enabled: false },
      { text: 'Accounting (Tally / Zoho)', enabled: false },
    ],
    labelAction: 'Choose standard',
  },
  {
    subscription: 'premium',
    price: 500,
    caption: 'Everything included',
    lists: [
      { text: 'Trip & Subtrip Management', enabled: true },
      { text: 'Driver & Salary Management', enabled: true },
      { text: 'Customer Invoicing', enabled: true },
      { text: 'Transporter Payments', enabled: true },
      { text: 'Vehicle Expenses', enabled: true },
      { text: 'Reports & Analytics', enabled: true },
      { text: 'WhatsApp Notifications', enabled: true },
      { text: 'Vehicle GPS Tracking', enabled: true },
      { text: 'E-Way Bill Integration', enabled: true },
      { text: 'eChallan Tracking', enabled: true },
      { text: 'GST / Vehicle API', enabled: true },
      { text: 'Maintenance & Inventory', enabled: true },
      { text: 'Tyre Management', enabled: true },
      { text: 'Accounting (Tally / Zoho)', enabled: true },
    ],
    labelAction: 'Choose premium',
  },
];

// ----------------------------------------------------------------------

export const _testimonials = [
  {
    name: 'Rajesh Sharma',
    postedDate: new Date('2026-02-15T08:30:00Z'),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(1),
    content: `Tranzit has completely transformed how we manage our fleet of 50 vehicles. The automated salary calculations and trip management save us hours every week. Excellent product!`,
  },
  {
    name: 'Vikram Singh',
    postedDate: new Date('2026-03-02T14:45:00Z'),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(2),
    content: `The E-Way bill integration and eChallan tracking are game changers. We no longer have to manually check multiple portals. Everything we need is right on the dashboard. Highly recommended for any Indian transporter.`,
  },
  {
    name: 'Anjali Desai',
    postedDate: new Date('2026-03-10T11:15:00Z'),
    ratingNumber: 4.5,
    avatarUrl: _mock.image.avatar(3),
    content: `Customer support is really fast and helpful. The tyre management module helped us identify which brands last longer on our regular routes, saving us thousands in replacement costs.`,
  },
  {
    name: 'Mohammed Ali',
    postedDate: new Date('2026-02-28T09:20:00Z'),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(4),
    content: `Amazing software! Real-time WhatsApp notifications keep our customers informed about their shipments without our dispatch team lifting a finger. The UI is very clean and easy to use.`,
  },
  {
    name: 'Sunil Patel',
    postedDate: new Date('2026-03-12T16:00:00Z'),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(5),
    content: `We've been using Tranzit for our transport business for the last 6 months. Managing subtrips, market vehicles, and transporter payments is so much easier now. 5/5 stars!`,
  },
  {
    name: 'Priya Iyer',
    postedDate: new Date('2026-01-20T10:05:00Z'),
    ratingNumber: 4.8,
    avatarUrl: _mock.image.avatar(6),
    content: `The accounting integration with Tally works flawlessly. No more manual data entry at the end of the month. It's the best TMS we've used in our 15 years in the logistics industry.`,
  },
];
