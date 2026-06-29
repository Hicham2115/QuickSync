import axios from "axios";

export const api = axios.create({
  baseURL: "",
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const status = error.response?.status;
    const method = config.method?.toUpperCase();

    // Only force-logout on 401 from write requests (mutations).  GET requests
    // (background fetches, /api/user health check) may legitimately fail during
    // a cold start or while the session is being established — redirecting on
    // those would cause an infinite login → dashboard → login loop.
    const isMutation = method && ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    if (status === 401 && isMutation && typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Retry only GET requests on network errors (not idempotent methods)
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
