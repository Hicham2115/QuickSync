import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 35_000, // cold start can take up to 30s on free tier
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Retry only GET requests on network errors (POST/PUT/DELETE are not retried — not idempotent)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const isNetworkError = !error.response;
    const isSafeMethod = config.method?.toUpperCase() === "GET";

    config._retryCount = config._retryCount ?? 0;

    if (isNetworkError && isSafeMethod && config._retryCount < 3) {
      config._retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 2000 * config._retryCount));
      return api(config);
    }

    return Promise.reject(error);
  }
);
