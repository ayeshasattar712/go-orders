import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clientEnv } from '@/lib/env';

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: clientEnv.NEXT_PUBLIC_API_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const csrf = document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrf_token='))
          ?.split('=')[1];

        if (csrf && config.headers) {
          config.headers['X-CSRF-Token'] = decodeURIComponent(csrf);
        }
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const status = error.response?.status;

      const isAuthEndpoint = error.config?.url?.includes('/auth/');

      if (
        status === 401 &&
        !isAuthEndpoint &&
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin/login')
      ) {
        const loginPath = '/admin/login';
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- outside React render/event context, useRouter is unavailable in this axios interceptor
        window.location.href = `${loginPath}?next=${encodeURIComponent(window.location.pathname)}`;
      }

      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        'Request failed';

      return Promise.reject(new Error(message));
    },
  );

  return instance;
}

export const apiClient = createApiClient();
export default apiClient;
