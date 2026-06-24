import { useNavigate, Link } from "react-router-dom";
import { AuthFormField } from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import type { LoginInput } from "@/types/user";

export default function Login() {
  const navigate = useNavigate();
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
      navigate("/");
    } catch {
      // error is set by the hook
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-800">Iniciar sesión</h1>
        <p className="text-sm text-500">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
      </div>

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

        {displayError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg
              text-red-700 bg-red-50 border border-red-200
              dark:text-red-300 dark:bg-red-900/20 dark:border-red-800/40"
          >
            <Icon icon="mdi:alert-circle" className="mt-0.5 shrink-0 text-base" />
            <span>{displayError}</span>
          </div>
        )}

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

      <p className="text-center text-sm text-500">
        ¿No tienes cuenta?{" "}
        <Link
          to="/signup"
          className="text-aurora font-semibold hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
