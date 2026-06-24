import { Icon } from "@iconify-icon/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Guest() {
  const { registerGuest } = useAuth();

  return (
    <div className="text-center space-y-6 p-6">
      <Icon
        icon="fluent:guest-24-filled"
        className="text-indigo-500 dark:text-indigo-400 mx-auto text-[7rem]"
      />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-800">
          Modo invitado
        </h1>
        <p className="text-sm text-500 max-w-xs mx-auto leading-relaxed">
          Explora Cardora sin registro. Puedes buscar cartas, armar tu
          colección y usar todas las funciones de inventario.
        </p>
      </div>

      <ul className="text-left text-sm text-600 space-y-3 bg-50 rounded-xl p-5 border-200">
        <li className="flex gap-3">
          <Icon
            icon="fluent:checkmark-circle-24-filled"
            className="text-indigo-500 dark:text-indigo-400 text-lg shrink-0 mt-px"
          />
          <span className="text-800">Acceso completo a búsqueda y catálogo</span>
        </li>
        <li className="flex gap-3">
          <Icon
            icon="fluent:checkmark-circle-24-filled"
            className="text-indigo-500 dark:text-indigo-400 text-lg shrink-0 mt-px"
          />
          <span className="text-800">Puedes registrar tus cartas y gestionar tu stock</span>
        </li>
        <li className="flex gap-3">
          <Icon
            icon="fluent:dismiss-circle-24-filled"
            className="text-300 text-lg shrink-0 mt-px"
          />
          <span className="text-400">
            Tus cartas no serán visibles para otros usuarios
          </span>
        </li>
        <li className="flex gap-3">
          <Icon
            icon="fluent:dismiss-circle-24-filled"
            className="text-300 text-lg shrink-0 mt-px"
          />
          <span className="text-400">
            Tus ofertas no aparecerán en el marketplace
          </span>
        </li>
        <li className="flex gap-3">
          <Icon
            icon="fluent:info-24-filled"
            className="text-indigo-500 dark:text-indigo-400 text-lg shrink-0 mt-px"
          />
          <span className="text-800">
            Puedes convertir tu cuenta a oficial en cualquier momento y
            conservarás todos tus datos.
          </span>
        </li>
      </ul>

      <Link
        to="/"
        onClick={registerGuest}
        className="btn-aurora flex items-center justify-center gap-2"
      >
        Ingresar como invitado
      </Link>
      
      <p className="text-center text-sm text-500">
        ¿Quieres guardar todo tu progreso?{" "}
        <Link to="/signup" className="text-aurora font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}