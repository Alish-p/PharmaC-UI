// Utilities for vehicle document status handling

// Returns one of: 'Valid' | 'Expiring' | 'Expired' | null
export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 15) return 'Expiring';
  return 'Valid';
}

export function getStatusMeta(status) {
  if (!status) return null;
  const map = {
    Expired: { color: 'error', icon: 'mdi:alert-circle-outline' },
    Expiring: { color: 'warning', icon: 'mdi:alert-outline' },
    Valid: { color: 'success', icon: 'mdi:check-circle-outline' },
    Missing: { color: 'default', icon: 'mdi:minus-circle-outline' },
  };
  return map[status] || null;
}
