import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="bg-200 min-h-svh flex flex-col justify-center items-center gap-3 px-4 py-8">
      <Link className="text-aurora font-bold text-2xl" to="/">
        Cardora
      </Link>
      <div className="w-full max-w-md border-200 rounded-xl surface shadow-sm">
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
      <label htmlFor={name} className="text-sm font-medium text-700">
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
          "px-3 py-2 rounded-lg bg-50 text-sm text-800 placeholder-400",
          "focus:outline-none focus:ring-2 focus:border-transparent transition duration-200",
          error
            ? "border border-red-400 focus:ring-red-400"
            : "border-200 focus:ring-indigo-400",
        ].join(" ")}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
};
