import { RoleEnum } from '@/types/enums/role.enum';
import { IUser } from '../user.interface';

export interface ILoginPayload {
  email: string;
  password: string;
  role: RoleEnum;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
  shop?: { name: string; id: string };
}

export interface IUpdateMechanicPersonalInfoPayload {
  profile_image_key: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  shop_name: string;
  address: string;
  state: string;
  city: string;
  zip: string;
}
