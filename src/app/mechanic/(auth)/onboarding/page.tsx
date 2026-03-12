import SuspenseLoading from '@/components/suspense-loading.component';
import { getMechanicOnboardingStep } from '@/constants/mechanic-onboarding.constants';
import { MECHANIC_ROUTES } from '@/routes/mechanic-routes';
import { AuthService } from '@/services/auth/auth.service';
import { MechanicOnboardingAPIService } from '@/services/mechanic/onboarding/mechanic-onboarding.service';
import { OnboardingStatusEnum } from '@/types/enums/onboarding-status.enum';
import { IAPIResponse } from '@/types/interfaces/api-response.interface';
import { ILoginResponse } from '@/types/interfaces/auth/auth-api.interface';
import { getQueryClient } from '@/utils/react-query.util';
import MechanicOnboardingView from '@/views/mechanic/(auth)/onboarding/mechanic-onboarding.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import { Suspense } from 'react';

const authService = new AuthService('server');
const mechanicOnboardingService = new MechanicOnboardingAPIService('server');

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [AuthService.keyFactory.getMe],
    queryFn: () => authService.getMe(),
  });

  await queryClient.prefetchQuery({
    queryKey: [MechanicOnboardingAPIService.keyFactory.getShopDetails],
    queryFn: () => mechanicOnboardingService.getShopDetails(),
  });

  await queryClient.prefetchQuery({
    queryKey: [MechanicOnboardingAPIService.keyFactory.getShopDetailsImages],
    queryFn: () => mechanicOnboardingService.getShopDetailsImages(),
  });

  await queryClient.prefetchQuery({
    queryKey: [MechanicOnboardingAPIService.keyFactory.getShopAvailability],
    queryFn: () => mechanicOnboardingService.getShopAvailability(),
  });

  const userData = queryClient.getQueryData<IAPIResponse<ILoginResponse>>([
    AuthService.keyFactory.getMe,
  ]);

  const initialStep = getMechanicOnboardingStep(
    userData?.data?.user?.user_onboarding_status,
  );

  if (
    userData?.data?.user?.user_onboarding_status ===
    OnboardingStatusEnum.PENDING_REVIEW
  ) {
    redirect(MECHANIC_ROUTES.profileReview);
  }

  return (
    <Suspense
      fallback={<SuspenseLoading message="Loading Onboarding Information..." />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MechanicOnboardingView initialStep={initialStep} />
      </HydrationBoundary>
    </Suspense>
  );
}
