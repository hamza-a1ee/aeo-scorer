/**
 * Capitalize the first letter of a string.
 *
 * @example capitalizeFirstLetter("hello") // "Hello"
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/** "content_readiness" → "Content Readiness" */
export const humanizeEnum = (value: string): string =>
  value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
