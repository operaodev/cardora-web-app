import { useNavigate, Link } from "react-router-dom";
import { AuthError, AuthFormField, AuthHead } from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState, useRef } from "react";
import type { UpgradeGuestInput } from "@/types/user";

const COOLDOWN = 30;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UpgradeGuest() {
  const navigate = useNavigate();
  const { upgradeGuest, sendCode, loading, error: apiError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const error = localError || apiError;

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (localError) setLocalError(null);
  };

  const handleSendCode = async () => {
    if (!email.trim() || cooldown > 0) return;

    if (!EMAIL_REGEX.test(email)) {
      setLocalError("Ingresa un correo electrónico válido");
      return;
    }

    setLocalError(null);
    try {
      await sendCode({ email });
      setCooldown(COOLDOWN);
      setCodeSent(true);
    } catch {
      // error handled by the hook
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const phone = (form.get("phone_number") as string).trim();
    const password = form.get("password") as string;
    const confirm = form.get("confirm_password") as string;
    const code = (form.get("code") as string).trim();

    if (!email.trim()) {
      setLocalError("Debes ingresar un correo electrónico");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setLocalError("Ingresa un correo electrónico válido");
      return;
    }

    if (!codeSent) {
      setLocalError("Debes enviar y verificar el código de tu correo primero");
      return;
    }

    if (!code) {
      setLocalError("Ingresa el código de verificación");
      return;
    }

    if (password.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirm) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    const input: UpgradeGuestInput = {
      name,
      email,
      password,
      code,
      ...(phone ? { phone_number: phone } : {}),
    };

    try {
      setIsUpgrading(true);
      await upgradeGuest(input);
      navigate("/");
    } catch {
      // apiError is set by the hook
    } finally {
      setIsUpgrading(false);
    }
  };

  const emailIsValid = EMAIL_REGEX.test(email);

  return (
    <div className="space-y-6 p-6">
      <AuthHead
        title="Oficializa tu cuenta"
        content="Guarda tu progreso permanentemente registrando tu cuenta."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormField
          label="Nombre"
          type="text"
          name="name"
          placeholder="Tu nombre"
        />

        <AuthFormField
          label="Teléfono (opcional)"
          type="tel"
          name="phone_number"
          placeholder="999 888 777"
        />

        {/* Email + botón enviar código */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-label">
            Email
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="correo@ejemplo.com"
              className="input-base flex-1 min-w-0 border-surface"
            />
            <button
              type="button"
              disabled={!emailIsValid || cooldown > 0 || loading}
              onClick={handleSendCode}
              className="sm:shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && !isUpgrading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Enviando…
                </>
              ) : cooldown > 0 ? (
                <>
                  <Icon icon="mdi:timer-outline" />
                  {cooldown}s
                </>
              ) : (
                <>
                  <Icon icon="mdi:email-send-outline" />
                  Enviar código
                </>
              )}
            </button>
          </div>
          {codeSent && cooldown === 0 && !loading && (
            <p className="text-xs text-indigo-500 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
              <Icon icon="mdi:check-circle-outline" />
              Código enviado — revisa tu correo
            </p>
          )}
        </div>

        {/* Código de verificación */}
        <AuthFormField
          label="Código de verificación"
          type="text"
          name="code"
          placeholder="Ingresa el código recibido"
        />

        <AuthFormField
          label="Contraseña"
          type="password"
          name="password"
          placeholder="••••••••"
        />

        <AuthFormField
          label="Confirmar contraseña"
          type="password"
          name="confirm_password"
          placeholder="••••••••"
        />

        <AuthError error={error} />

        <button
          type="submit"
          disabled={loading}
          className="btn-aurora disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && isUpgrading ? (
            <span className="flex items-center justify-center gap-2">
              <Icon icon="mdi:loading" className="animate-spin" />
              Guardando progreso…
            </span>
          ) : (
            "Oficializar cuenta"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-second">
        <Link to="/" className="text-aurora font-semibold hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
