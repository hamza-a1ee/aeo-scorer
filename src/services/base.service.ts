// Utils

import { getClientCookie, removeClientCookie } from '@/utils/get-client-cookie';
import { getServerCookie } from '@/utils/get-server-cookie';

import type { AxiosInstance } from 'axios';
import axios from 'axios';

import { COMMON_ROUTES } from '@/routes/common-routes';
import { TCookieSource } from '@/types/types/common/common.type';
import { redirect } from 'next/navigation';
import { BASE_URL } from './api-base-url';

export abstract class APIService {
  private axiosInstance: AxiosInstance;
  private header: Record<string, string> = {};

  constructor(isServer?: TCookieSource, baseUrl?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl ? baseUrl : (BASE_URL as string),
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            removeClientCookie();
            window.location.href = COMMON_ROUTES.selectRole;
          } else {
            redirect(
              `/api/auth/logout?redirect=${encodeURIComponent(COMMON_ROUTES.selectRole)}`,
            );
          }
        }

        return Promise.reject(error);
      },
    );

    this.setupInterceptors(isServer);
  }

  private setupInterceptors(isServer?: TCookieSource) {
    this.axiosInstance.interceptors.request.use(
      async config => {
        let token;
        if (isServer === 'server') {
          token = await getServerCookie();
        } else {
          token = getClientCookie();
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );
  }

  setHeader(key: string, value: string) {
    this.header[key] = value;
  }

  getHeader() {
    return this.header;
  }

  get(url: string, params = {}, config = {}) {
    return this.axiosInstance.get(url, {
      params,
      ...config,
    });
  }

  post(url: string, data = {}, config = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data = {}, config = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data = {}, config = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(
    url: string,
    data?: Record<string, unknown> | null | string,
    config = {},
  ) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request(config = {}) {
    return this.axiosInstance(config);
  }
}
