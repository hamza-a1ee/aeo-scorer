import MechanicDashboardLayout from '@/layouts/mechanic-dashboard.layout';
import { AuthService } from '@/services/auth/auth.service';
import { getQueryClient } from '@/utils/react-query.util';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const authService = new AuthService('server');
export default async function MechanicDashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ============================ Hooks ============================
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [AuthService.keyFactory.getMe],
    queryFn: () => authService.getMe(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MechanicDashboardLayout>{children}</MechanicDashboardLayout>
    </HydrationBoundary>
  );
}
