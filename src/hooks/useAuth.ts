import { useCallback, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import * as authApi from "@/api/auth";
import type {
  LoginInput,
  RegisterInput,
  SendCodeInput,
  UpgradeGuestInput,
} from "@/types/user";
import axios from "axios";

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  if (axios.isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  return err instanceof Error ? err.message : fallback;
}

export function useAuth() {
  const {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    logout: clearSession,
  } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: unknown) {
        setError(extractError(err, "Error inesperado"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    (input: LoginInput) =>
      handle(async () => {
        const { user, access_token, refresh_token } =
          await authApi.login(input);
        setAuth(user, access_token, refresh_token);
      }),
    [handle, setAuth],
  );

  const register = useCallback(
    (input: RegisterInput) =>
      handle(async () => {
        const { user, access_token, refresh_token } =
          await authApi.register(input);
        setAuth(user, access_token, refresh_token);
      }),
    [handle, setAuth],
  );

  const registerGuest = useCallback(
    () =>
      handle(async () => {
        const { user, access_token, refresh_token } =
          await authApi.registerGuest();
        setAuth(user, access_token, refresh_token);
      }),
    [handle, setAuth],
  );

  const sendCode = useCallback(
    (input: SendCodeInput) => handle(() => authApi.sendCode(input)),
    [handle],
  );

  const upgradeGuest = useCallback(
    (input: UpgradeGuestInput) =>
      handle(async () => {
        const { user, access_token, refresh_token } =
          await authApi.upgradeGuest(input);
        setAuth(user, access_token, refresh_token);
      }),
    [handle, setAuth],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    register,
    registerGuest,
    sendCode,
    upgradeGuest,
    logout,
    loading,
    error,
  };
}
