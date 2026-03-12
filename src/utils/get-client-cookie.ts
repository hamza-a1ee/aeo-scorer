import { ACCESS_TOKEN } from '@/constants';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

export const getClientCookie = () => {
  return getCookie(ACCESS_TOKEN);
};

export const removeClientCookie = () => {
  deleteCookie(ACCESS_TOKEN);
};

export const setClientCookie = (token: string) => {
  setCookie(ACCESS_TOKEN, token);
};
