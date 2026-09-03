import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: '/',
  changelog: '/',
  zoneStore: '/',
  minimalStore: '/',
  freeUI: '/',
  figma: '',
  tools: {
    root: '/tools',
    lrGenerator: '/tools/lr-generator',
  },
  blog: {
    root: '/blog',
  },
  public: {
    root: `/public`,
    subtrip: (id) => `/public/subtrip/${id}`,
    epod: (id) => `/public/subtrip/epod/${id}`,
    transporterPayment: (id) => `/public/transporter-payment/${id}`,
  },
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    overview: `${ROOTS.DASHBOARD}/overview`,
    medicine: {
      root: `${ROOTS.DASHBOARD}/medicine`,
      list: `${ROOTS.DASHBOARD}/medicine`,
      new: `${ROOTS.DASHBOARD}/medicine/new`,
    },
    batch: {
      root: `${ROOTS.DASHBOARD}/batch`,
      list: `${ROOTS.DASHBOARD}/batch`,
    },
    pos: {
      root: `${ROOTS.DASHBOARD}/pos`,
    },
    prescription: {
      root: `${ROOTS.DASHBOARD}/prescription`,
    },
    supplier: {
      root: `${ROOTS.DASHBOARD}/supplier`,
      list: `${ROOTS.DASHBOARD}/supplier`,
    },
    customer: {
      root: `${ROOTS.DASHBOARD}/customer`,
      list: `${ROOTS.DASHBOARD}/customer`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      list: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      details: (id) => (id ? `${ROOTS.DASHBOARD}/user/${id}` : `${ROOTS.DASHBOARD}/user`),
      edit: (id) => (id ? `${ROOTS.DASHBOARD}/user/${id}/edit` : `${ROOTS.DASHBOARD}/user`),
    },
    settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
    },
    permission: `${ROOTS.DASHBOARD}/permission`,
    tenant: `${ROOTS.DASHBOARD}/settings`,
    paymentHistory: `${ROOTS.DASHBOARD}/settings`,
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
    },
    vehicle: {
      root: `${ROOTS.DASHBOARD}/vehicle`,
      new: `${ROOTS.DASHBOARD}/vehicle/new`,
      list: `${ROOTS.DASHBOARD}/vehicle/list`,
      documents: `${ROOTS.DASHBOARD}/vehicle/documents`,
      documentsGrid: `${ROOTS.DASHBOARD}/vehicle/documents-grid`,
      bulkKmImport: `${ROOTS.DASHBOARD}/vehicle/bulk-km-import`,
      edit: (id) => `${ROOTS.DASHBOARD}/vehicle/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/vehicle/${id}`,
      newDocument: `${ROOTS.DASHBOARD}/vehicle/documents/new`,
      editDocument: (id) => `${ROOTS.DASHBOARD}/vehicle/documents/${id}/edit`,
      documentDetails: (id) => `${ROOTS.DASHBOARD}/vehicle/documents/${id}`,
    },
    driver: {
      root: `${ROOTS.DASHBOARD}/driver`,
      new: `${ROOTS.DASHBOARD}/driver/new`,
      list: `${ROOTS.DASHBOARD}/driver/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/driver/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/driver/${id}`,
    },
    pump: {
      root: `${ROOTS.DASHBOARD}/pump`,
      new: `${ROOTS.DASHBOARD}/pump/new`,
      list: `${ROOTS.DASHBOARD}/pump/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/pump/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/pump/${id}`,
    },


    transporter: {
      root: `${ROOTS.DASHBOARD}/transporter`,
      new: `${ROOTS.DASHBOARD}/transporter/new`,
      list: `${ROOTS.DASHBOARD}/transporter/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/transporter/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/transporter/${id}`,
    },

    expense: {
      root: `${ROOTS.DASHBOARD}/expense`,
      new: `${ROOTS.DASHBOARD}/expense/new-subtrip-expense`,
      newVehicleExpense: `${ROOTS.DASHBOARD}/expense/new-vehicle-expense`,
      list: `${ROOTS.DASHBOARD}/expense/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/expense/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/expense/${id}`,
    },
    transporterAdvance: {
      root: `${ROOTS.DASHBOARD}/transporter-advance`,
      list: `${ROOTS.DASHBOARD}/transporter-advance/list`,
      new: `${ROOTS.DASHBOARD}/expense/new-transporter-advance`, // Reuse existing form route
    },
    subtrip: {
      root: `${ROOTS.DASHBOARD}/subtrip`,
      jobCreate: `${ROOTS.DASHBOARD}/subtrip/job/create`,
      list: `${ROOTS.DASHBOARD}/subtrip/list`,
      receive: `${ROOTS.DASHBOARD}/subtrip/receive`,
      edit: (id) => `${ROOTS.DASHBOARD}/subtrip/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/subtrip/${id}`,
    },

    trip: {
      root: `${ROOTS.DASHBOARD}/trip`,
      list: `${ROOTS.DASHBOARD}/trip/list`,
      routeAnalyzer: `${ROOTS.DASHBOARD}/trip/route-analyzer`,
      edit: (id) => `${ROOTS.DASHBOARD}/trip/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/trip/${id}`,
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      list: `${ROOTS.DASHBOARD}/invoice/list`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
    },
    driverSalary: {
      root: `${ROOTS.DASHBOARD}/driverSalary`,
      new: `${ROOTS.DASHBOARD}/driverSalary/new`,
      details: (id) => `${ROOTS.DASHBOARD}/driverSalary/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/driverSalary/${id}/edit`,
    },
    loan: {
      root: `${ROOTS.DASHBOARD}/loan`,
      new: `${ROOTS.DASHBOARD}/loan/new`,
      details: (id) => `${ROOTS.DASHBOARD}/loan/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/loan/${id}/edit`,
    },
    transporterPayment: {
      root: `${ROOTS.DASHBOARD}/transporterPayment`,
      new: `${ROOTS.DASHBOARD}/transporterPayment/new`,
      list: `${ROOTS.DASHBOARD}/transporterPayment/list`,
      details: (id) => `${ROOTS.DASHBOARD}/transporterPayment/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/transporterPayment/${id}/edit`,
      bulkCreate: `${ROOTS.DASHBOARD}/transporterPayment/bulk-create`,
    },
    // Superuser: Tenants management
    tenants: {
      root: `${ROOTS.DASHBOARD}/tenants`,
      new: `${ROOTS.DASHBOARD}/tenants/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tenants/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tenants/${id}/edit`,
    },
    maintenanceDashboard: `${ROOTS.DASHBOARD}/maintenance-dashboard`,
    part: {
      root: `${ROOTS.DASHBOARD}/part`,
      new: `${ROOTS.DASHBOARD}/part/new`,
      list: `${ROOTS.DASHBOARD}/part/list`,
      bulkImport: `${ROOTS.DASHBOARD}/part/bulk-import`,
      details: (id) => `${ROOTS.DASHBOARD}/part/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/part/${id}/edit`,
    },
    partLocation: {
      root: `${ROOTS.DASHBOARD}/part-location`,
      new: `${ROOTS.DASHBOARD}/part-location/new`,
      list: `${ROOTS.DASHBOARD}/part-location/list`,
      details: (id) => `${ROOTS.DASHBOARD}/part-location/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/part-location/${id}/edit`,
    },
    vendor: {
      root: `${ROOTS.DASHBOARD}/vendor`,
      new: `${ROOTS.DASHBOARD}/vendor/new`,
      list: `${ROOTS.DASHBOARD}/vendor/list`,
      details: (id) => `${ROOTS.DASHBOARD}/vendor/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/vendor/${id}/edit`,
    },
    purchaseOrder: {
      root: `${ROOTS.DASHBOARD}/purchaseOrder`,
      new: `${ROOTS.DASHBOARD}/purchaseOrder/new`,
      list: `${ROOTS.DASHBOARD}/purchaseOrder/list`,
      details: (id) => `${ROOTS.DASHBOARD}/purchaseOrder/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/purchaseOrder/${id}/edit`,
    },
    workOrder: {
      root: `${ROOTS.DASHBOARD}/workOrder`,
      new: `${ROOTS.DASHBOARD}/workOrder/new`,
      list: `${ROOTS.DASHBOARD}/workOrder/list`,
      details: (id) => `${ROOTS.DASHBOARD}/workOrder/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/workOrder/${id}/edit`,
    },
    tyre: {
      root: `${ROOTS.DASHBOARD}/tyre`,
      dashboard: `${ROOTS.DASHBOARD}/tyre/dashboard`,
      new: `${ROOTS.DASHBOARD}/tyre/new`,
      list: `${ROOTS.DASHBOARD}/tyre/list`,
      bulkImport: `${ROOTS.DASHBOARD}/tyre/bulk-import`,
      details: (id) => `${ROOTS.DASHBOARD}/tyre/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tyre/${id}/edit`,
    },
  },
};
