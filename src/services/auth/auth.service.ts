import { IAPIResponse } from '@/types/interfaces/api-response.interface';
import {
  ILoginPayload,
  ILoginResponse,
  IUpdateMechanicPersonalInfoPayload,
} from '@/types/interfaces/auth/auth-api.interface';
import {
  IForgotPasswordForm,
  ISetNewPasswordPayload,
  IVerifyResetOtp,
  IVerifyResetResponse,
} from '@/types/interfaces/auth/forgot-password/form.interface';
import { APIService } from '../base.service';

export class AuthService extends APIService {
  public static readonly keyFactory = {
    login: 'auth-login',
    signup: 'auth-signup',
    forgotPassword: 'auth-forgot-password',
    verifyResetOTP: 'auth-verify-reset-otp',
    setNewPassword: 'auth-set-new-password',
    verifyEmail: 'auth-verify-email',
    resendOtp: 'auth-resend-otp',
    getMe: 'auth-get-me',
    updateMechanicPersonalInfo: 'auth-update-mechanic-personal-info',
  };
  async login(data: ILoginPayload): Promise<IAPIResponse<ILoginResponse>> {
    return (await this.post(`/auth/login`, data)).data;
  }

  async signup<T extends object>(data: T): Promise<IAPIResponse> {
    return (await this.post(`/auth/sign-up`, data)).data;
  }
  async forgotPassword(data: IForgotPasswordForm): Promise<IAPIResponse> {
    return (await this.post(`/auth/forgot-password`, data)).data;
  }

  async verifyResetOTP(data: IVerifyResetOtp): Promise<IAPIResponse> {
    return (await this.post(`/auth/verify-reset-otp`, data)).data;
  }

  async setNewPassword(data: ISetNewPasswordPayload): Promise<IAPIResponse> {
    return (await this.post(`/auth/set-new-password`, data)).data;
  }
  async verifyEmail(
    data: IVerifyResetOtp,
  ): Promise<IAPIResponse<IVerifyResetResponse>> {
    return (await this.post(`/auth/verify-email`, data)).data;
  }

  async resendOtp(data: IForgotPasswordForm): Promise<IAPIResponse> {
    return (await this.post(`/auth/resend-otp`, data)).data;
  }

  async getMe(): Promise<IAPIResponse<ILoginResponse>> {
    return (await this.get(`/users/me`)).data;
  }

  async updateMechanicPersonalInfo(
    data: IUpdateMechanicPersonalInfoPayload,
  ): Promise<IAPIResponse> {
    return (await this.patch(`/users/mechanic-profile`, data)).data;
  }
}

export const authService = new AuthService();
