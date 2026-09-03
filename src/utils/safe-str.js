/**
 * Safely convert any value to a human-readable string for display in UI.
 * Guards against [object Object] when event details contain raw Mongoose ObjectIds
 * or partially-populated documents that were stored before the backend serialization fix.
 *
 * @param {any} val
 * @returns {string}
 */
export const safeStr = (val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') {
    // Mongoose-style populated doc or any object with _id
    if (val._id) return String(val._id);
    // Best-effort JSON for other objects
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
};
