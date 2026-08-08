import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clientEnv } from '@/lib/env';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${clientEnv.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    return (response.data?.data?.accessToken as string | undefined) ?? null;
  } catch {
    return null;
  }
}

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
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined;
      const status = error.response?.status;

      if (status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
        original._retry = true;

        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

        const token = await refreshPromise;
        if (token) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          return instance(original);
        }

        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
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
