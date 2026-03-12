import { AxiosError, AxiosResponse } from "axios";

export type CustomAxiosErrorType = AxiosError<{
  message: string;
}>;
export interface Meta {
  count: number;
  limit: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedResponse {
  meta: Meta;
}

export interface CustomAxiosResponse extends AxiosResponse {
  data: {
    message: string | string[];
  };
}

export interface AxiosErrorExtended extends AxiosError {
  response: CustomAxiosResponse;
}

export interface IOpenedModal<T> {
  data: unknown;
  modalType: T;
}
