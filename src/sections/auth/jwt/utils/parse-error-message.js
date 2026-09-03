/** Extracts a human-readable message from any error shape */
export function parseErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return error.message;
  return 'An unexpected error occurred';
}
