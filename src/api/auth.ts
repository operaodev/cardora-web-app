import { apiClient } from "./client";
import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  User,
  SendCodeInput,
  UpgradeGuestInput,
} from "@/types/user";
import { useUserStore } from "@/stores/useUserStore";

/* ---------- Auth API calls ---------- */

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/users/login", input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/users/register",
    input,
  );
  return data;
}

export async function registerGuest(): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/users/guest");
  return data;
}

export async function sendCode(input: SendCodeInput): Promise<void> {
  await apiClient.post("/users/send-code", input);
}

export async function refreshToken(): Promise<AuthResponse> {
  const refresh = useUserStore.getState().refreshToken;
  const { data } = await apiClient.post<AuthResponse>("/users/refresh", {
    refresh_token: refresh,
  });
  return data;
}

export async function upgradeGuest(
  input: UpgradeGuestInput,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/users/upgrade",
    input,
  );
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}

/* ---------- Interceptors ---------- */

let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;
let refreshing = false;

export function setupAuthInterceptors(): () => void {
  requestInterceptor = apiClient.interceptors.request.use((config) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ponytail: single global lock, per-request queue if concurrent 401s become an issue
  responseInterceptor = apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (
        error.response?.status !== 401 ||
        original._retry ||
        refreshing
      ) {
        return Promise.reject(error);
      }

      original._retry = true;
      refreshing = true;

      try {
        const res = await refreshToken();
        const { user, access_token, refresh_token } = res;
        useUserStore.getState().setAuth(user, access_token, refresh_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(original);
      } catch {
        useUserStore.getState().logout();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    },
  );

  return () => {
    if (requestInterceptor !== null) {
      apiClient.interceptors.request.eject(requestInterceptor);
      requestInterceptor = null;
    }
    if (responseInterceptor !== null) {
      apiClient.interceptors.response.eject(responseInterceptor);
      responseInterceptor = null;
    }
  };
}
