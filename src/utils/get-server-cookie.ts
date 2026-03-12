'use server';

import { cookies } from 'next/headers';

import { ACCESS_TOKEN } from '@/constants';

export const getServerCookie = async (): Promise<string | undefined> => {
  const cookie = await cookies();
  return cookie.get(ACCESS_TOKEN)?.value;
};

/** Must be called from a Server Action or Route Handler. */
export const removeServerCookie = async (): Promise<void> => {
  const cookie = await cookies();
  cookie.delete(ACCESS_TOKEN);
};
