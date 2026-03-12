export interface IAPIResponse<T = unknown> {
  success: boolean;
  message: string;
  errors?: string[];
  data?: T;
  meta?: {
    total: number;
    totalPage: number;
    currentPage: number;
    limit: number;
  };
}

export interface IPaginationPayload {
  limit: number;
  page: number;
}
