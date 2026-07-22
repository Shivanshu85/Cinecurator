/**
 * Centralized Axios API client with:
 * - Persistent HTTP/HTTPS Connection Pooling (Keep-Alive)
 * - Fast failover timeouts & retry logic
 * - Unified error handling & cancellation
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import http from "http";
import https from "https";

const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Node.js Persistent Keep-Alive HTTP/HTTPS Agents to eliminate TCP/TLS handshake overhead
const isServer = typeof window === "undefined";
const httpAgent = isServer ? new http.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 20 }) : undefined;
const httpsAgent = isServer ? new https.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 20 }) : undefined;

/** Shared Axios instance for external API calls (TMDB). */
export const apiClient = axios.create({
  timeout: 3000,
  headers: { "Content-Type": "application/json" },
  httpAgent,
  httpsAgent,
});

export let isTmdbOffline = false;

// Interceptor to detect TMDB network blockages and set the offline flag
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND" || !err.response) {
      isTmdbOffline = true;
    }
    return Promise.reject(err);
  }
);

/** Shared Axios instance for internal Next.js API routes */
export const internalClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  httpAgent,
  httpsAgent,
});

// –– Retry interceptor ––
function addRetryInterceptor(client: typeof apiClient) {
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retryCount?: number;
    };

    if (!config) return Promise.reject(error);

    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
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
