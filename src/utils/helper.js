/**
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_flatten
 * https://github.com/you-dont-need-x/you-dont-need-lodash
 */

// ----------------------------------------------------------------------

export function flattenArray(list, key = 'children') {
  let children = [];

  const flatten = list?.map((item) => {
    if (item[key] && item[key].length) {
      children = [...children, ...item[key]];
    }
    return item;
  });

  return flatten?.concat(children.length ? flattenArray(children, key) : children);
}

// ----------------------------------------------------------------------

export function flattenDeep(array) {
  const isArray = array && Array.isArray(array);

  if (isArray) {
    return array.flat(Infinity);
  }
  return [];
}

// ----------------------------------------------------------------------

export function orderBy(array, properties, orders) {
  return array.slice().sort((a, b) => {
    for (let i = 0; i < properties.length; i += 1) {
      const property = properties[i];
      const order = orders && orders[i] === 'desc' ? -1 : 1;

      const aValue = a[property];
      const bValue = b[property];

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
    }
    return 0;
  });
}

// ----------------------------------------------------------------------

export function keyBy(array, key) {
  return (array || []).reduce((result, item) => {
    const keyValue = key ? item[key] : item;

    return { ...result, [String(keyValue)]: item };
  }, {});
}

// ----------------------------------------------------------------------

export function sumBy(array, iteratee) {
  return array.reduce((sum, item) => sum + iteratee(item), 0);
}

// ----------------------------------------------------------------------

export function isEqual(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

// ----------------------------------------------------------------------

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export const merge = (target, ...sources) => {
  if (!sources.length) return target;

  const source = sources.shift();

  // eslint-disable-next-line no-restricted-syntax
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      merge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return merge(target, ...sources);
};

// ----------------------------------------------------------------------

export function getStateCode(state) {
  if (!state) return '';
  const s = state.trim().toLowerCase();
  const codes = {
    'jammu and kashmir': '01',
    'jammu & kashmir': '01',
    'himachal pradesh': '02',
    punjab: '03',
    chandigarh: '04',
    uttarakhand: '05',
    haryana: '06',
    delhi: '07',
    rajasthan: '08',
    'uttar pradesh': '09',
    bihar: '10',
    sikkim: '11',
    'arunachal pradesh': '12',
    nagaland: '13',
    manipur: '14',
    mizoram: '15',
    tripura: '16',
    meghalaya: '17',
    assam: '18',
    'west bengal': '19',
    jharkhand: '20',
    odisha: '21',
    orissa: '21',
    chhattisgarh: '22',
    'madhya pradesh': '23',
    gujarat: '24',
    'daman and diu': '25',
    'daman & diu': '25',
    'dadra and nagar haveli': '26',
    'dadra & nagar haveli': '26',
    maharashtra: '27',
    'andhra pradesh': '28',
    karnataka: '29',
    goa: '30',
    lakshadweep: '31',
    kerala: '32',
    telangana: '36',
    'tamil nadu': '33',
    puducherry: '34',
    pondicherry: '34',
    'andaman and nicobar islands': '35',
    'andaman & nicobar islands': '35',
    ladakh: '38',
  };
  return codes[s] || '';
}
