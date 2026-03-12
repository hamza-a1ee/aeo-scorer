import SuspenseLoading from '@/components/suspense-loading.component';
import { getCustomerOnboardingStep } from '@/constants/customer-onboarding.constants';
import { COMMON_ROUTES } from '@/routes/common-routes';
import { AuthService } from '@/services/auth/auth.service';
import { CustomerOnboardingAPIService } from '@/services/customer/onboarding/customer-onboarding.service';
import { OnboardingStatusEnum } from '@/types/enums/onboarding-status.enum';
import { IAPIResponse } from '@/types/interfaces/api-response.interface';
import { IMe } from '@/types/interfaces/user.interface';
import { getQueryClient } from '@/utils/react-query.util';
import CustomerOnboardingView from '@/views/customer/(auth)/onboarding/customer-onboarding.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const authService = new AuthService('server');
const customerOnboardingService = new CustomerOnboardingAPIService('server');
export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [AuthService.keyFactory.getMe],
    queryFn: () => authService.getMe(),
  });

  await queryClient.prefetchQuery({
    queryKey: [CustomerOnboardingAPIService.keyFactory.getCustomerAddress],
    queryFn: () => customerOnboardingService.getCustomerAddress(),
  });

  const userData = queryClient.getQueryData<IAPIResponse<IMe>>([
    AuthService.keyFactory.getMe,
  ]);
  const initialStep = getCustomerOnboardingStep(
    userData?.data?.user?.user_onboarding_status,
  );

  if (
    userData?.data?.user?.user_onboarding_status ===
    OnboardingStatusEnum.COMPLETED
  ) {
    redirect(COMMON_ROUTES.home);
  }
  return (
    <Suspense
      fallback={<SuspenseLoading message="Loading Onboarding Information..." />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomerOnboardingView initialStep={initialStep} />
      </HydrationBoundary>
    </Suspense>
  );
}
