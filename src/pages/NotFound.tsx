import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-dvh gap-6 px-4">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full
          border border-surface bg-surface"
      >
        <Icon
          icon="material-symbols:error-outline"
          className="text-[48px] text-subtle"
        />
      </div>

      <div className="flex flex-col items-center gap-2 text-center max-w-sm">
        <h2 className="text-xl font-bold text-title">Página no encontrada</h2>
        <p className="text-sm text-content leading-relaxed">
          La página o producto que buscas no existe.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-aurora w-auto px-8 py-3"
      >
        <span className="inline-flex items-center gap-2">
          <Icon icon="material-symbols:arrow-back" className="text-[18px]" />
          Regresar a la página anterior
        </span>
      </button>
    </div>
  );
}
