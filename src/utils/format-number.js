import { formatNumberLocale } from 'src/locales';

// ----------------------------------------------------------------------

const DEFAULT_LOCALE = { code: 'en-IN', currency: 'INR' };

function processInput(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

// this returns string value so dificult to use in Excel export

// export function fNumber(inputValue, options) {
//   const locale = formatNumberLocale() || DEFAULT_LOCALE;

//   const number = processInput(inputValue);
//   if (number === null) return '';

//   const fm = new Intl.NumberFormat(locale.code, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//     ...options,
//   }).format(number);

//   return fm;
// }

// ----------------------------------------------------------------------

export function fNumber(inputValue) {
  const number = processInput(inputValue);
  if (number === null) return null;

  return Number(number.toFixed(2));
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue, options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm.replace(/(\d)(?=[A-Za-z]+)/, '$1 ');
}

// ----------------------------------------------------------------------

export function fData(inputValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;
  return fm;
}

// ----------------------------------------------------------------------

export function fCurrencyInWords(inputValue) {
  let val = inputValue;
  if (typeof val !== 'number') {
    val = parseFloat(val);
  }
  if (Number.isNaN(val) || val === 0) return 'ZERO RUPEES ONLY';

  val = Math.round(val);

  const ones = [
    '',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
    'TEN',
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN',
  ];

  const tens = [
    '',
    '',
    'TWENTY',
    'THIRTY',
    'FORTY',
    'FIFTY',
    'SIXTY',
    'SEVENTY',
    'EIGHTY',
    'NINETY',
  ];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    let temp = '';
    let rem = n;
    if (rem >= 100) {
      temp += `${ones[Math.floor(rem / 100)]} HUNDRED `;
      rem %= 100;
    }
    if (rem >= 20) {
      temp += `${tens[Math.floor(rem / 10)]} `;
      rem %= 10;
    }
    if (rem > 0) {
      temp += `${ones[rem]} `;
    }
    return temp.trim();
  }

  let words = '';

  const crore = Math.floor(val / 10000000);
  val %= 10000000;
  if (crore > 0) {
    words += `${convertLessThanThousand(crore)} CRORE `;
  }

  const lakh = Math.floor(val / 100000);
  val %= 100000;
  if (lakh > 0) {
    words += `${convertLessThanThousand(lakh)} LAKH `;
  }

  const thousand = Math.floor(val / 1000);
  val %= 1000;
  if (thousand > 0) {
    words += `${convertLessThanThousand(thousand)} THOUSAND `;
  }

  if (val > 0) {
    words += `${convertLessThanThousand(val)}`;
  }

  return `${words.trim()} RUPEES ONLY`.replace(/\s+/g, ' ');
}
