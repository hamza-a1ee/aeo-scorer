import { OTP_REASON_ENUM } from "@/types/enums/login-source.enum";
import { IUser } from "../../user.interface";

export interface IForgotPasswordForm {
  email: string;
}

export interface IResendOtpForm {
  email: string;
  reason: OTP_REASON_ENUM;
}

export interface ISetNewPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface IVerifyResetOtp {
  email: string;
  otp: string;
}

export interface IVerifyResetResponse {
  user: IUser;
  token: string;
}

export interface ISetNewPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
