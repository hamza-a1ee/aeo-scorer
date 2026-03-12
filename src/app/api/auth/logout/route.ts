import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

import { ACCESS_TOKEN } from '@/constants';
import { COMMON_ROUTES } from '@/routes/common-routes';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get('redirect') ?? COMMON_ROUTES.selectRole;

  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN);

  return Response.redirect(new URL(redirectTo, req.url));
}
