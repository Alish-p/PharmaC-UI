import { enUS as enUSDate } from '@mui/x-date-pickers/locales';
import { enUS as enUSDataGrid } from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'IN',
    adapterLocale: 'en',
    numberFormat: { code: 'en-IN', currency: 'INR' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'hi',
    label: 'Hindi',
    countryCode: 'IN',
    adapterLocale: 'hi',
    numberFormat: { code: 'hi-IN', currency: 'INR' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
