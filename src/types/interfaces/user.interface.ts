import { LoginSourceEnum } from '../enums/login-source.enum';
import { OnboardingStatusEnum } from '../enums/onboarding-status.enum';
import { RoleEnum } from '../enums/role.enum';

export interface IUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  profile_url: string | null;
  email: string | null;
  phone_number: string | null;
  role: RoleEnum;
  login_source: LoginSourceEnum;
  user_onboarding_status: OnboardingStatusEnum;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface IMe {
  user: IUser;
}
