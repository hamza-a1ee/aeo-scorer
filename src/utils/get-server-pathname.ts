import { headers } from 'next/headers';

/**
 * Get the pathname of the current page from the server
 * @returns The pathname of the current page
 */
export async function getServerPathname(): Promise<string> {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  const fullUrl = headersList.get('referer') || '';
  const [, pathname] =
    fullUrl.match(new RegExp(`https?:\/\/${domain}(.*)`)) || [];
  return pathname || '';
}
