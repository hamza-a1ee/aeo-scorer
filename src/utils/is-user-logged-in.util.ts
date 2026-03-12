import { getClientCookie } from './get-client-cookie';

/**
 * Checks if the user is logged in by checking the client cookie
 * @returns true if user is logged in, false otherwise
 */
export function isUserLoggedIn() {
  return getClientCookie() ? true : false;
}
