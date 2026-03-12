/**
 * Capitalize the first letter of a string.
 *
 * @param str - The input string.
 *
 * @returns - The string with the first letter capitalized.
 *
 * @example capitalizeFirstLetter("hello") // Returns "Hello"
 *
 * @throws - If no string is provided.
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) throw new Error('No string provided');

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const humanizeEnum = (value: string): string =>
  value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export function getFileExtensionFromUrl(urlOrPath: string): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;

  try {
    let fileName: string | undefined;

    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      const parsed = new URL(urlOrPath);
      fileName = parsed.pathname.split('/').pop();
    } else {
      fileName = urlOrPath.split('/').pop();
    }

    if (!fileName || !fileName.includes('.')) return null;

    return fileName.split('.').pop()?.toLowerCase() || null;
  } catch {
    return null;
  }
}
