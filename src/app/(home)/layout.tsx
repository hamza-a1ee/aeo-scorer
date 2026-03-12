import NonLoggedInUserDialog from '@/components/non-logged-in-user.dialog';
import { AuthService } from '@/services/auth/auth.service';
import { getServerPathname } from '@/utils/get-server-pathname';
import { getQueryClient } from '@/utils/react-query.util';
import Footer from '@/views/(home)/footer.component';
import Navbar from '@/views/(home)/navbar.component';
import RequestQuoteSidesheet from '@/views/(home)/request-a-quote/request-quote-sidesheet.component';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

interface Props {
  children: React.ReactNode;
}
const authService = new AuthService('server');
export default async function HomeLayout({ children }: Props) {
  const pathname = await getServerPathname();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [AuthService.keyFactory.getMe],
    queryFn: () => authService.getMe(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {' '}
      <div className="w-full min-h-dvh flex flex-col justify-between bg-presence-bg relative">
        <div className="sticky top-0 z-10 shadow">
          <Navbar pathname={pathname} />
        </div>
        <div className="flex-1">
          {children}
          <RequestQuoteSidesheet />
        </div>
        <NonLoggedInUserDialog />
        <Footer />
      </div>
    </HydrationBoundary>
  );
}
