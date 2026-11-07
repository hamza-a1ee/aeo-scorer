import type { AxiosError } from 'axios';

import type { IAPIResponse } from '@/types/interfaces/api-response.interface';

import { capitalizeFirstLetter } from './helper.util';

export function parseError(error: unknown): string {
  const axiosError = error as AxiosError<IAPIResponse>;
  const message = axiosError?.response?.data?.message;
  if (!message) {
    return axiosError?.message || 'Something went wrong';
  }
  return capitalizeFirstLetter(Array.isArray(message) ? message[0] : message);
}

export function getErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError)?.response?.status;
}
