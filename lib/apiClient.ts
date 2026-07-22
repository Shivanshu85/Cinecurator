/**
 * Centralized Axios API client with:
 * - Retry logic (up to 3 retries for network errors / 5xx)
 * - Request cancellation via AbortController
 * - Response interceptors for unified error handling
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Shared Axios instance for external API calls (TMDB). 
 * Shorter timeout so blocked TMDB requests fail quickly and failover gracefully without hanging the page. */
export const apiClient = axios.create({
  timeout: 2500,
  headers: { "Content-Type": "application/json" },
});

export let isTmdbOffline = false;

// Interceptor to detect TMDB network blockages and set the offline flag
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    isTmdbOffline = true;
    return Promise.reject(err);
  }
);

/** Shared Axios instance for internal Next.js API routes */
export const internalClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// –– Retry interceptor ––
function addRetryInterceptor(client: typeof apiClient) {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retryCount?: number;
    };

    if (!config) return Promise.reject(error);

    const isNetworkError = !error.response;
    const isServerError =
      error.response && error.response.status >= 500;
    const isCancelled = axios.isCancel(error);

    if (isCancelled) return Promise.reject(error);

    config._retryCount = (config._retryCount ?? 0) + 1;

    if (config._retryCount <= RETRY_LIMIT && (isNetworkError || isServerError)) {
      await sleep(RETRY_DELAY_MS * config._retryCount);
      return client(config);
    }

    return Promise.reject(error);
  });
}

// Only retry internal API requests; fail external TMDB calls fast without retrying
addRetryInterceptor(internalClient);

/** Create a cancellable request config. Pass the signal to axios requests. */
export function createCancellable() {
  const controller = new AbortController();
  return { signal: controller.signal, cancel: () => controller.abort() };
}
