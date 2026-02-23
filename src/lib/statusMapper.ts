// Normalize a status string the same way the backend does:
// trim, uppercase, replace spaces with underscores.
export const normalizeStatus = (s: string): string =>
  s.trim().toUpperCase().replace(/\s+/g, '_');

// Convert a canonical status (e.g. "TO_APPLY") into a human-readable label
// (e.g. "To Apply"). Used for UI display only.
export const canonicalToLabel = (canonical: string): string =>
  canonical
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const transformForBackend = (data: any) => {
  if (data && typeof data.status === 'string') {
    return { ...data, status: normalizeStatus(data.status) };
  }
  return data;
};

export const transformFromBackend = (data: any) => data;
