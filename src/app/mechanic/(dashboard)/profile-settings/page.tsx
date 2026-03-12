import SuspenseLoading from '@/components/suspense-loading.component';
import { MechanicVerificationService } from '@/services/mechanic/profile-settings/mechanic-verification.service';
import { getQueryClient } from '@/utils/react-query.util';
import ProfileSettingsView from '@/views/mechanic/(dashboard)/profile-settings/profile-settings.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

const mechanicVerificationService = new MechanicVerificationService('server');
export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [MechanicVerificationService.keyFactory.getProfileCreationReview],
    queryFn: () => mechanicVerificationService.getProfileCreationReview(),
  });
  return (
    <Suspense
      fallback={<SuspenseLoading message="Loading Profile Settings..." />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileSettingsView />
      </HydrationBoundary>
    </Suspense>
  );
}
