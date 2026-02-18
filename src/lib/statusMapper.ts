// Status is now a plain string passed through as-is (no conversion needed).
// These functions are kept for backward compatibility but are now no-ops.

export const transformForBackend = (data: any) => data;

export const transformFromBackend = (data: any) => data;
