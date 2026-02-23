// Normalize a status string the same way the backend does:
// trim, uppercase, replace spaces with underscores.
export const normalizeStatus = (s: string): string =>
  s.trim().toUpperCase().replace(/\s+/g, '_');

export const transformForBackend = (data: any) => {
  if (data && typeof data.status === 'string') {
    return { ...data, status: normalizeStatus(data.status) };
  }
  return data;
};

export const transformFromBackend = (data: any) => data;
