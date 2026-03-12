import SuspenseLoading from '@/components/suspense-loading.component';
import { getMechanicVerificationStep } from '@/constants/mechanic-verification.constant';
import { MECHANIC_ROUTES } from '@/routes/mechanic-routes';
import { AuthService } from '@/services/auth/auth.service';
import { MechanicOnboardingAPIService } from '@/services/mechanic/onboarding/mechanic-onboarding.service';
import { MechanicVerificationService } from '@/services/mechanic/profile-settings/mechanic-verification.service';
import {
  SHOP_VERIFICATION_ENUM,
  VERIFICATION_STEPS_ENUM,
} from '@/types/enums/verification-steps.enum';
import { IAPIResponse } from '@/types/interfaces/api-response.interface';
import { IProfileCreationReviewResponse } from '@/types/interfaces/mechanic/profile-verification/profile-verification.interface';
import { getQueryClient } from '@/utils/react-query.util';
import ProfileCreationView from '@/views/mechanic/profile-verification/profile-verification.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const mechanicVerificationService = new MechanicVerificationService('server');
const mechanicOnboardingService = new MechanicOnboardingAPIService('server');
const authService = new AuthService('server');
export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [MechanicVerificationService.keyFactory.getProfileCreationReview],
    queryFn: () => mechanicVerificationService.getProfileCreationReview(),
  });

  const verificationData = queryClient.getQueryData<
    IAPIResponse<IProfileCreationReviewResponse>
  >([MechanicVerificationService.keyFactory.getProfileCreationReview]);

  // Map VERIFICATION_STEP_STATUS_ENUM to VERIFICATION_STEPS_ENUM if needed
  const verificationStepStatus = verificationData?.data?.verification_step as
    | VERIFICATION_STEPS_ENUM
    | undefined;

  const initialStep = getMechanicVerificationStep(verificationStepStatus);

  if (
    verificationData?.data?.verification_status !==
    SHOP_VERIFICATION_ENUM.UNVERIFIED
  ) {
    redirect(MECHANIC_ROUTES.profileSettings);
  }

  await queryClient.prefetchQuery({
    queryFn: () => mechanicVerificationService.getProfileCreationReview(),
    queryKey: [MechanicVerificationService.keyFactory.getProfileCreationReview],
  });

  await queryClient.prefetchQuery({
    queryFn: () => mechanicOnboardingService.getShopDetails(),
    queryKey: [MechanicOnboardingAPIService.keyFactory.getShopDetails],
  });

  await queryClient.prefetchQuery({
    queryKey: [AuthService.keyFactory.getMe],
    queryFn: () => authService.getMe(),
  });

  return (
    <Suspense
      fallback={
        <SuspenseLoading message="Loading Verification Information..." />
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileCreationView initialStep={initialStep} />
      </HydrationBoundary>
    </Suspense>
  );
}
