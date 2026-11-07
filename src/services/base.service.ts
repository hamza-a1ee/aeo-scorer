import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';

/**
 * Base class for every client-side service. Each domain service extends it,
 * exposes a static `keyFactory` for TanStack Query keys, and exports a
 * singleton. Calls go to this app's own `/api/*` route handlers.
 */
export abstract class APIService {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl = '/api') {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  get(url: string, params = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.get(url, { params, ...config });
  }

  post(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(
    url: string,
    data?: Record<string, unknown> | null | string,
    config: AxiosRequestConfig = {},
  ) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request(config: AxiosRequestConfig = {}) {
    return this.axiosInstance(config);
  }
}
