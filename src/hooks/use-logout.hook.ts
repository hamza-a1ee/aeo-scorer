// logout.util.ts (or hooks/use-logout.hook.ts)
'use client';
import { useRouter } from 'next/navigation';
import { removeClientCookie } from '../utils/get-client-cookie';
import { COMMON_ROUTES } from '@/routes/common-routes';

export function useLogout() {
  // ====================Hooks====================
  const router = useRouter();

  return (logoutUrl?: string) => {
    removeClientCookie();
    window.location.href = logoutUrl ?? COMMON_ROUTES.home;
    router.refresh();
  };
}
