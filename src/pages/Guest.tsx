import { Icon } from "@iconify-icon/react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthFooter } from "@/layouts/AuthLayout";

export default function Guest() {
  const { registerGuest, user } = useAuth();

  if (user) return <Navigate to={"/"} />;

  return (
    <div className="text-center space-y-6 p-6">
      <Icon
        icon="fluent:guest-24-filled"
        className="text-special mx-auto text-[7rem]"
      />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-title">Modo invitado</h1>
        <p className="text-sm text-content max-w-xs mx-auto leading-relaxed">
          Explora Cardora sin registro. Puedes buscar cartas, armar tu colección
          y usar todas las funciones de inventario.
        </p>
      </div>

      <ul className="text-left text-sm text-label space-y-3 bg-muted rounded-xl p-5 border-surface">
        <Point content="Acceso completo a búsqueda y catálogo" />
        <Point content="Puedes registrar tus cartas y gestionar tu stock" />
        <Point
          type="restricted"
          content="Tus cartas no serán visibles para otros usuarios"
        />
        <Point
          type="restricted"
          content="Tus ofertas no aparecerán en el marketplace"
        />
        <Point
          type="info"
          content={
            "Puedes convertir tu cuenta a oficial en cualquier momento y conservarás todos tus datos."
          }
        />
      </ul>

      <Link
        to="/"
        onClick={registerGuest}
        className="btn-aurora flex items-center justify-center gap-2"
      >
        Ingresar como invitado
      </Link>

      <AuthFooter
        message="¿Quieres guardar todo tu progreso?"
        to="/signup"
        anchor="Registrate aquí"
      />
    </div>
  );
}

interface Props {
  content: string;
  type?: "info" | "restricted" | "permitted";
}

const Point = ({ content, type = "permitted" }: Props) => {
  return (
    <li className="flex gap-3">
      <Icon
        icon={
          type === "info"
            ? "fluent:info-24-filled"
            : type === "restricted"
              ? "fluent:dismiss-circle-24-filled"
              : "fluent:checkmark-circle-24-filled"
        }
        className={`
            text-lg shrink-0 mt-px
            ${
              type !== "restricted"
                ? "text-special"
                : "text-gray-300 dark:text-gray-600"
            }
          `}
      />
      <span className={type !== "restricted" ? "text-label" : "text-subtle"}>
        {content}
      </span>
    </li>
  );
};
