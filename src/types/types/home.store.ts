import { TVoidCallback } from './common/common.type';

export type TNonLoggedInRedirection = {
  /** Relative URL (path + query) to redirect to after login */
  url: string;
  /** Shop id associated with the redirect (for opening Request Quote) */
  shopId: string;
  /** Expiry timestamp (ms); redirect is valid only while Date.now() < expiryAt */
  expiryAt: number;
} | null;

/** Expiry duration for non-logged-in quote redirect (10 minutes). */
export const NON_LOGGED_IN_REDIRECT_EXPIRY_MS = 10 * 60 * 1000;

/** Returns redirect if valid (has url, shopId, and not expired); otherwise null. */
export function getValidNonLoggedInRedirect(
  redirect: TNonLoggedInRedirection,
): TNonLoggedInRedirection {
  if (!redirect?.url || !redirect?.shopId) return null;
  const expiryAt = (redirect as { expiryAt?: number }).expiryAt;
  if (typeof expiryAt !== 'number' || Date.now() > expiryAt) return null;
  return redirect;
}

export type THomeState = {
  openNonLoggedInUserDialog: boolean;
  nonLoggedInRedirection: TNonLoggedInRedirection;
};

export type THomActions = {
  setOpenNonLoggedInUserDialog: TVoidCallback<[boolean]>;
  setNonLoggedInRedirection: TVoidCallback<[TNonLoggedInRedirection]>;
};

export type THomeStore = THomeState & THomActions;
