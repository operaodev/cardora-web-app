import { Icon } from "@iconify-icon/react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AuthLayout() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-3 px-4 py-8 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 right-6 md:top-8 md:right-8 text-content hover:text-title transition-colors focus:outline-none"
        aria-label="Cerrar"
      >
        <Icon icon="mdi:close" className="text-3xl" />
      </button>

      <Link className="text-aurora font-bold text-2xl" to="/">
        Cardora
      </Link>
      <div className="w-full max-w-md border-surface rounded-xl bg-surface shadow-md shadow-surface relative">
        <Outlet />
      </div>
    </main>
  );
}

interface AuthFormFieldProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  error?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const AuthFormField = ({
  label,
  type,
  name,
  placeholder,
  error,
  onChange,
  value,
}: AuthFormFieldProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-sm font-medium text-label">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className={[
          "input-base w-full",
          error
            ? "border border-red-400 focus:ring-red-400"
            : "border-surface focus:ring-indigo-400",
        ].join(" ")}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
};

interface AuthFooterProps {
  message: string;
  anchor: string;
  to: string;
}

export const AuthFooter = ({ message, anchor, to }: AuthFooterProps) => {
  return (
    <p className="text-center text-sm text-content">
      {message}
      <Link to={to} className="ml-2 text-aurora font-semibold hover:underline">
        {anchor}
      </Link>
    </p>
  );
};

export const AuthError = ({ error }: { error: string | null }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg
        text-red-700 bg-red-50 border border-red-200
        dark:text-red-300 dark:bg-red-800/20 dark:border-red-800/40"
    >
      <Icon icon="mdi:alert-circle" className="mt-0.5 shrink-0 text-base" />
      <span>{error}</span>
    </div>
  );
};

export const AuthHead = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-2xl font-bold text-title">{title}</h1>
      <p className="text-sm text-content">{content}</p>
    </div>
  );
};
