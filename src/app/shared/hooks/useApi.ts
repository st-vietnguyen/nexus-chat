import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';

import { ApiService } from '@core/services/api.service';

const apiService = new ApiService();

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
}

interface ApiConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const useApi = <T>(
  method: HttpMethod,
  url: (string | object)[],
  config: ApiConfig = {},
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const requestData = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const { headers, params, data } = config;
      const apiMethods: Record<HttpMethod, () => Promise<T>> = {
        get: () => apiService.get(url, params, headers) as Promise<T>,
        post: () => apiService.post(url, data, headers) as Promise<T>,
        put: () => apiService.put(url, data, headers) as Promise<T>,
        delete: () => apiService.delete(url, headers) as Promise<T>,
      };

      const response = await apiMethods[method]();
      setState({ data: response, loading: false, error: null });
    } catch (error) {
      const axiosError = error as AxiosError;
      setState({
        data: null,
        loading: false,
        error: axiosError,
      });
    }
  }, [method, url, config]);

  useEffect(() => {
    requestData();
  }, []);

  return { ...state };
};

export const useGet = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('get', url, config);

export const usePost = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('post', url, config);

export const usePut = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('put', url, config);

export const useDelete = <T>(
  url: (string | object)[],
  config: ApiConfig = {},
) => useApi<T>('delete', url, config);
