import dayjs from 'dayjs';

export function toDatePickerValue(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string' || value.trim() === '')
    return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
}

/**
 * Converts a date string to ISO format, or returns null if empty/invalid.
 */
export function toIsoDateOrNull(
  value: string | null | undefined,
): string | null {
  if (value == null || typeof value !== 'string' || value.trim() === '')
    return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatExpirationDate(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string' || value.trim() === '')
    return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
