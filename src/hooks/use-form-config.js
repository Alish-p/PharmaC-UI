import { useMemo, useCallback } from 'react';

import { useTenant } from 'src/query/use-tenant';

/**
 * Get the field config for a specific entity.
 * @param {string} entity - 'subtrip' | 'vehicle' | 'driver'
 * @returns {{ fields: Object, freightConfig: Object }}
 */
export function useFieldConfig(entity) {
  const { data: currentTenant } = useTenant();

  return useMemo(() => {
    const config = currentTenant?.config?.[entity] || {};
    if (!config) return { fields: {}, allowedFreightModels: [], defaultFreightModel: '' };

    let fields = config.fields || {};

    // Handle Mongoose Map serialization — convert if needed
    if (fields instanceof Map || (fields && typeof fields.entries === 'function')) {
      fields = Object.fromEntries(fields);
    }

    return {
      fields,
      allowedFreightModels: config.allowedFreightModels || [],
      defaultFreightModel: config.defaultFreightModel || '',
    };
  }, [currentTenant, entity]);
}

/**
 * Get visibility for a specific field.
 * @returns 'required' | 'optional' | 'hidden'
 */
export function useFieldVisibility(entity, fieldName) {
  const { fields } = useFieldConfig(entity);
  return fields[fieldName]?.visibility || 'optional';
}

/**
 * Get the label for a specific field with fallback.
 */
export function useFieldLabel(entity, fieldName, fallback = '') {
  const { fields } = useFieldConfig(entity);
  return fields[fieldName]?.label || fallback;
}

/**
 * Get all visible fields (not hidden) for an entity.
 */
export function useVisibleFields(entity) {
  const { fields } = useFieldConfig(entity);
  return useMemo(
    () =>
      Object.entries(fields)
        .filter(([, config]) => config.visibility !== 'hidden')
        .map(([name, config]) => ({ name, ...config })),
    [fields]
  );
}

/**
 * Get all required fields for an entity.
 */
export function useRequiredFields(entity) {
  const { fields } = useFieldConfig(entity);
  return useMemo(
    () =>
      Object.entries(fields)
        .filter(([, config]) => config.visibility === 'required')
        .map(([name]) => name),
    [fields]
  );
}

/**
 * Get freight config (default model + allowed models).
 */
export function useFreightConfig(entity = 'subtrip') {
  const { allowedFreightModels, defaultFreightModel } = useFieldConfig(entity);
  return {
    allowedModels: allowedFreightModels,
    defaultModel: defaultFreightModel,
  };
}

/**
 * Helper hook that returns utility functions for field config.
 * Use this in form components for cleaner code.
 */
export function useFieldHelpers(entity) {
  const { fields, allowedFreightModels, defaultFreightModel } = useFieldConfig(entity);

  const isVisible = useCallback(
    (fieldName) => {
      const field = fields[fieldName];
      return field ? field.visibility !== 'hidden' : true;
    },
    [fields]
  );

  const isRequired = useCallback(
    (fieldName) => {
      const field = fields[fieldName];
      return field ? field.visibility === 'required' : false;
    },
    [fields]
  );

  const getLabel = useCallback(
    (fieldName, fallback = '') => {
      const field = fields[fieldName];
      const label = field?.label || fallback;
      return isRequired(fieldName) ? `${label} *` : label;
    },
    [fields, isRequired]
  );

  return { isVisible, isRequired, getLabel, fields, freightConfig: { allowedModels: allowedFreightModels, defaultModel: defaultFreightModel } };
}
