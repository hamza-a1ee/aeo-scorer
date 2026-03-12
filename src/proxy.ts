import axios from 'axios';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ACCESS_TOKEN } from './constants';
import { API_URL } from './services/api-base-url';
import { OnboardingStatusEnum } from './types/enums/onboarding-status.enum';
import { RoleEnum } from './types/enums/role.enum';
import { IAPIResponse } from './types/interfaces/api-response.interface';
import { ILoginResponse } from './types/interfaces/auth/auth-api.interface';

const publicRoutes: string[] = [
  '/select-role',
  '/auth/google-redirect',
  '/customer/login',
  '/customer/signup',
  '/mechanic/login',
  '/mechanic/signup',
  '/mechanic/forgot-password',
  '/customer/forgot-password',
  '/auth/google-redirect/callback',
  // '/home',
];

const customerProtectedRoutes: string[] = [
  '/customer/onboarding',
  '/my-quotes',
];
const mechanicProtectedRoutes: string[] = [
  '/mechanic/onboarding',
  '/mechanic/profile-review',
  '/mechanic/dashboard',
  '/mechanic/quotes',
  '/mechanic/bookings-management',

  '/mechanic/service-management',
  '/mechanic/discounts',
  '/mechanic/messages',
  '/mechanic/marketing-tools',
  '/mechanic/profile-settings',
  '/mechanic/profile-verification',
  '/mechanic/quote-requests',
];

const authService = async function (
  token: string,
): Promise<IAPIResponse<ILoginResponse> | null> {
  try {
    return (
      await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      })
    ).data;
  } catch {
    return null;
  }
};

// This function can be marked `async` if using
//  `await` inside
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get(ACCESS_TOKEN)?.value ?? '';

  if (pathname === '/auth/google-redirect/callback') return NextResponse.next();

  if (token) {
    const userData = await authService(token);

    if (!userData) {
      return handleRedirect('/select-role?t=1', req, null, true);
    }

    const role = userData?.data?.user?.role;
    const isCustomerRoute = CheckIfMatch(customerProtectedRoutes, pathname);
    const isMechanicRoute = CheckIfMatch(mechanicProtectedRoutes, pathname);

    if (
      pathname !== '/customer/onboarding' &&
      userData?.data?.user?.role === RoleEnum.CUSTOMER &&
      userData?.data?.user?.user_onboarding_status !==
        OnboardingStatusEnum.COMPLETED
    ) {
      return handleRedirect('/customer/onboarding', req, userData?.data?.token);
    }

    if (
      pathname !== '/mechanic/profile-review' &&
      userData?.data?.user?.role === RoleEnum.MECHANIC &&
      userData?.data?.user?.user_onboarding_status ===
        OnboardingStatusEnum.PENDING_REVIEW
    ) {
      return handleRedirect(
        '/mechanic/profile-review',
        req,
        userData?.data?.token,
      );
    }
    if (
      pathname !== '/mechanic/onboarding' &&
      userData?.data?.user?.role === RoleEnum.MECHANIC &&
      userData?.data?.user?.user_onboarding_status !==
        OnboardingStatusEnum.COMPLETED &&
      userData?.data?.user?.user_onboarding_status !==
        OnboardingStatusEnum.PENDING_REVIEW
    ) {
      return handleRedirect('/mechanic/onboarding', req, userData?.data?.token);
    }

    if (
      // pathname !== "/mechanic/profile-review" &&
      pathname === '/mechanic/profile-review' &&
      userData?.data?.user?.role === RoleEnum.MECHANIC &&
      userData?.data?.user?.user_onboarding_status ===
        OnboardingStatusEnum.COMPLETED
    ) {
      return handleRedirect('/mechanic/dashboard', req, userData?.data?.token);
    }
    if (
      (role === RoleEnum.CUSTOMER && isMechanicRoute) ||
      (role === RoleEnum.MECHANIC && isCustomerRoute)
    ) {
      return handleRedirect('/home', req, userData?.data?.token);
    }

    if (pathname === '/' || publicRoutes.includes(pathname)) {
      if (role === RoleEnum.MECHANIC)
        return handleRedirect(
          '/mechanic/dashboard',
          req,
          userData?.data?.token,
        );
      return handleRedirect('/home', req, userData?.data?.token);
    }

    if (
      (pathname === '/customer/onboarding' ||
        pathname === '/mechanic/onboarding') &&
      userData?.data?.user?.user_onboarding_status ===
        OnboardingStatusEnum.COMPLETED
    ) {
      return handleRedirect('/home', req, userData?.data?.token);
    }
  }

  if (!token) {
    if (
      (pathname === '/' ||
        CheckIfMatch(customerProtectedRoutes, pathname) ||
        CheckIfMatch(mechanicProtectedRoutes, pathname)) &&
      pathname !== '/home'
    ) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};

const DynamicMatch = (pattern: string, path: string): boolean => {
  const patternSegments = pattern.split('/');
  const pathSegments = path.split('/');

  if (patternSegments.length !== pathSegments.length) return false;

  return patternSegments.every(
    (seg, i) => seg.startsWith(':') || seg === pathSegments[i],
  );
};

const CheckIfMatch = (routes: string[], checkingPath: string): boolean => {
  return routes.some(
    route => route === checkingPath || DynamicMatch(route, checkingPath),
  );
};

const handleRedirect = (
  url: string,
  req: NextRequest,
  token?: string | null,
  deleteToken?: boolean,
) => {
  const res = NextResponse.redirect(new URL(url, req.url));

  if (token) {
    res.cookies.set(ACCESS_TOKEN, token);
  }
  if (deleteToken) {
    res.cookies.delete(ACCESS_TOKEN);
  }
  return res;
};
