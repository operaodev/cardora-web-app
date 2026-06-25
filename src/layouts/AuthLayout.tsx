import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="bg-prominent min-h-screen flex flex-col justify-center items-center gap-3 px-4 py-8">
      <Link className="text-aurora font-bold text-2xl" to="/">
        Cardora
      </Link>
      <div className="w-full max-w-md border-surface rounded-xl surface shadow-sm">
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
