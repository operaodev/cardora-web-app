import { useNavigate, useLocation } from "react-router-dom";
import {
  AuthError,
  AuthFooter,
  AuthFormField,
  AuthHead,
} from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import type { LoginInput } from "@/types/user";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const { login, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const displayError = localError || error;

  const clearError = () => {
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim();
    const password = form.get("password") as string;

    if (!email) {
      setLocalError("Debes ingresar tu correo electrónico");
      return;
    }

    if (!password) {
      setLocalError("Debes ingresar tu contraseña");
      return;
    }

    const input: LoginInput = { email, password };

    try {
      await login(input);
      navigate(redirectTo);
    } catch {
      // error is set by the hook
    }
  };

  return (
    <div className="space-y-6 p-6">
      <AuthHead
        title="Iniciar sesión"
        content="Ingresa tus credenciales para acceder a tu cuenta."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormField
          label="Email"
          type="email"
          name="email"
          placeholder="correo@ejemplo.com"
          onChange={clearError}
        />
        <AuthFormField
          label="Contraseña"
          type="password"
          name="password"
          placeholder="••••••••"
          onChange={clearError}
        />

        <AuthError error={displayError} />

        <button
          type="submit"
          disabled={loading}
          className="btn-aurora disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Icon icon="mdi:loading" className="animate-spin" />
              Ingresando…
            </span>
          ) : (
            "Ingresar"
          )}
        </button>
      </form>

      <AuthFooter
        message="¿No tienes cuenta?"
        to="/signup"
        anchor="Registrate aquí"
      />
    </div>
  );
}
