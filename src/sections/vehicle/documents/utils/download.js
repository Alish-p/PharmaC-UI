import axios from 'src/utils/axios';

/**
 * Fetches a temporary download URL for a document and opens it in a new tab.
 * Falls back to the provided URL if available.
 */
export async function openDocumentDownload({ vehicleId, docId, fallbackUrl, signal } = {}) {
  if (!vehicleId || !docId) return;
  try {
    const { data } = await axios.get(`/api/documents/${vehicleId}/${docId}/download`, { signal });
    const url = data?.url || fallbackUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    // Fallback to provided URL if request fails
    if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
}

export async function getDocumentDownloadUrl({ vehicleId, docId, signal } = {}) {
  if (!vehicleId || !docId) return null;
  try {
    const { data } = await axios.get(`/api/documents/${vehicleId}/${docId}/download`, { signal });
    return data?.url || null;
  } catch (e) {
    return null;
  }
}
