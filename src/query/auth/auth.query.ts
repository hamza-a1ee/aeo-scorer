import { AuthService, authService } from '@/services/auth/auth.service';
import { ISignupPayload } from '@/shared/interfaces/auth/signup.interface';
import { IAPIResponse } from '@/types/interfaces/api-response.interface';
import {
  ILoginPayload,
  ILoginResponse,
  IUpdateMechanicPersonalInfoPayload,
} from '@/types/interfaces/auth/auth-api.interface';
import {
  IForgotPasswordForm,
  IResendOtpForm,
  ISetNewPasswordPayload,
  IVerifyResetOtp,
} from '@/types/interfaces/auth/forgot-password/form.interface';
import { throwError } from '@/utils/react-query.util';
import { setClientCookie } from '@/utils/get-client-cookie';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useSignup() {
  return useMutation({
    mutationFn: (payload: ISignupPayload) => authService.signup(payload),
    mutationKey: [AuthService.keyFactory.signup],
    onError: throwError('Signup Failed'),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: IVerifyResetOtp) => authService.verifyEmail(payload),
    mutationKey: [AuthService.keyFactory.verifyEmail],
    onError: throwError('Email Verification Failed'),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: ILoginPayload) => authService.login(payload),
    mutationKey: [AuthService.keyFactory.login],
    onError: throwError('Login Failed'),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: IForgotPasswordForm) =>
      authService.forgotPassword(payload),
    mutationKey: [AuthService.keyFactory.forgotPassword],
    onError: throwError('Forgot Password Failed'),
  });
}

export function useVerifyResetOTP() {
  return useMutation({
    mutationFn: (payload: IVerifyResetOtp) =>
      authService.verifyResetOTP(payload),
    mutationKey: [AuthService.keyFactory.verifyResetOTP],
    onError: throwError('OTP Verification Failed'),
  });
}

export function useSetNewPassword() {
  return useMutation({
    mutationFn: (payload: ISetNewPasswordPayload) =>
      authService.setNewPassword(payload),
    mutationKey: [AuthService.keyFactory.setNewPassword],
    onError: throwError('Set New Password Failed'),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: IResendOtpForm) => authService.resendOtp(payload),
    mutationKey: [AuthService.keyFactory.resendOtp],
    onError: throwError('Resend OTP Failed'),
  });
}

export function useGetMe(options?: { enabled?: boolean }) {
  return useQuery<IAPIResponse<ILoginResponse>>({
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await authService.getMe();
      if (res?.data?.token) {
        setClientCookie(res.data.token);
      }
      return res;
    },
    queryKey: [AuthService.keyFactory.getMe],
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateMechanicPersonalInfo() {
  return useMutation({
    mutationFn: (payload: IUpdateMechanicPersonalInfoPayload) =>
      authService.updateMechanicPersonalInfo(payload),
    mutationKey: [AuthService.keyFactory.updateMechanicPersonalInfo],
    onError: throwError('Update Mechanic Personal Info Failed'),
  });
}
