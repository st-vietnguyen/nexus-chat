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

type HttpMethod =
  | 'GET'
  | 'get'
  | 'POST'
  | 'post'
  | 'PUT'
  | 'put'
  | 'DELETE'
  | 'delete';

export const useApi = <T>(
  method: HttpMethod,
  url: (string | object)[],
  config: ApiConfig = {},
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      let response: T;
      const { headers, params, data } = config;
      switch (method.toUpperCase()) {
        case 'GET':
          response = (await apiService.get(url, params, headers)) as T;
          break;
        case 'POST':
          response = (await apiService.post(url, data, headers)) as T;
          break;
        case 'PUT':
          response = (await apiService.put(url, data, headers)) as T;
          break;
        case 'DELETE':
          response = (await apiService.delete(url, headers)) as T;
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
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
    fetchData();
  }, []);

  return { ...state };
};

export const useGet = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('GET', url, config);

export const usePost = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('POST', url, config);

export const usePut = <T>(url: (string | object)[], config: ApiConfig = {}) =>
  useApi<T>('PUT', url, config);

export const useDelete = <T>(
  url: (string | object)[],
  config: ApiConfig = {},
) => useApi<T>('DELETE', url, config);
