'use client';

import { COMMON_ROUTES } from '@/routes/common-routes';
import { CUSTOMER_ROUTES } from '@/routes/customer-routes';
import { MECHANIC_ROUTES } from '@/routes/mechanic-routes';
import { OnboardingStatusEnum } from '@/types/enums/onboarding-status.enum';
import { RoleEnum } from '@/types/enums/role.enum';
import { useHomeStore } from '@/stores/home.store';
import { useQuoteStore } from '@/stores/quote.store';
import { setClientCookie } from '@/utils/get-client-cookie';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';
import {
  getValidNonLoggedInRedirect,
  type TNonLoggedInRedirection,
} from '@/types/types/home.store';

const TOKEN_KEYS = ['accessToken', 'token', 'access_token'];
const HOME_STORAGE_KEY = 'home-store';

/** Read nonLoggedInRedirection from localStorage (persist hasn't rehydrated yet). */
function getRedirectFromStorage(): TNonLoggedInRedirection {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HOME_STORAGE_KEY);
    if (!raw) return null;
    const { state } = JSON.parse(raw) as { state?: { nonLoggedInRedirection?: TNonLoggedInRedirection } };
    return state?.nonLoggedInRedirection ?? null;
  } catch {
    return null;
  }
}
const CALLBACK_KEY = 'callback';

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = searchParams[key];
  if (value == null) return null;
  const single = Array.isArray(value) ? value[0] : value;
  return single?.trim() ? single : null;
}

function getFirstParam(
  searchParams: Record<string, string | string[] | undefined>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const v = getParam(searchParams, key);
    if (v) return v;
  }
  return null;
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function GoogleRedirectHandler({ searchParams }: Props) {
  const router = useRouter();
  const nonLoggedInRedirection = useHomeStore(
    state => state.nonLoggedInRedirection,
  );
  const setNonLoggedInRedirection = useHomeStore(
    state => state.setNonLoggedInRedirection,
  );
  const setQuoteOpen = useQuoteStore(state => state.setOpen);
  const setQuoteShopId = useQuoteStore(state => state.setShopId);
  const token = getFirstParam(searchParams, TOKEN_KEYS);
  const callbackPath = getParam(searchParams, CALLBACK_KEY);
  const message = getParam(searchParams, 'message');
  const role = getParam(searchParams, 'role');
  const step = getParam(searchParams, 'step');
  const email = getParam(searchParams, 'email');

  useLayoutEffect(() => {
    if (token) {
      setClientCookie(token);

      if (role === RoleEnum.CUSTOMER) {
        if (step === OnboardingStatusEnum.COMPLETED) {
          // When onboarding is complete, redirect to stored quote URL if present (same-origin only, not expired).
          // Use store first; fallback to localStorage because persist rehydrates after this effect runs.
          const rawRedirect =
            nonLoggedInRedirection ?? getRedirectFromStorage();
          const redirect = getValidNonLoggedInRedirect(rawRedirect);
          if (redirect !== rawRedirect && rawRedirect) {
            setNonLoggedInRedirection(null);
          }
          if (redirect?.url && redirect.shopId) {
            let safePath: string | null = null;
            if (redirect.url.startsWith('/')) {
              safePath = redirect.url;
            } else {
              try {
                const parsed = new URL(redirect.url, window.location.origin);
                if (parsed.origin === window.location.origin) {
                  safePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
                }
              } catch {
                safePath = null;
              }
            }
            if (safePath) {
              setNonLoggedInRedirection(null);
              setQuoteShopId(redirect.shopId);
              setQuoteOpen(true);
              router.push(safePath);
              return;
            }
          }
          router.push(COMMON_ROUTES.home);
          return;
        }
        router.push(
          `${CUSTOMER_ROUTES.auth.onboarding}?email=${encodeURIComponent(email || '')}`,
        );
      } else if (role === RoleEnum.MECHANIC) {
        if (step === OnboardingStatusEnum.COMPLETED) {
          router.push(MECHANIC_ROUTES.dashboard);
          return;
        }
        router.push(
          `${MECHANIC_ROUTES.auth.onboarding}?email=${encodeURIComponent(email || '')}`,
        );
      }
    }
  }, [token, callbackPath, searchParams, router, role, email, step, token]);

  if (!token) {
    const errorMessage =
      message ??
      'Something went wrong signing in with Google. Please try again.';
    const loginUrl = message
      ? `${CUSTOMER_ROUTES.auth.login}?error=${encodeURIComponent(message)}`
      : CUSTOMER_ROUTES.auth.login;

    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Sign In Failed
              </h1>
              <p className="text-gray-600 leading-relaxed">{errorMessage}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={loginUrl}
                className="w-full min-h-12 flex items-center justify-center gap-2 bg-primary text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
