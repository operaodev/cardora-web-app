import { useRef, useState, useCallback } from "react";
import { useScrollHide } from "@/components/hooks/useScrollHide";
import { Icon } from "@iconify-icon/react";
import { PopoverRef } from "@/components/modal/Popover";

export interface PageControlProps {
  /** Página actual (1-indexed) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Primera página actualmente en caché */
  loadedFrom?: number;
  /** Última página actualmente en caché */
  loadedUpTo: number;
  /** Callback cuando el usuario selecciona una página */
  onPageChange: (page: number) => void;
}

/**
 * PageControl — control de navegación de páginas agnóstico.
 *
 * Comportamiento:
 * - Se oculta al hacer scroll hacia abajo y reaparece al subir.
 * - Muestra hasta 5 botones de página; si hay más, el último
 *   abre un PopoverRef con las páginas restantes.
 * - Si la página destino ya fue cargada (loadedUpTo >= page),
 *   hace scroll al ancla de esa página en el DOM.
 * - Si no fue cargada, llama a onPageChange para que el padre
 *   reinicie la carga desde esa página.
 */
export default function PageControl({
  currentPage,
  totalPages,
  loadedFrom = 1,
  loadedUpTo,
  onPageChange,
}: PageControlProps) {
  const isInCache = (page: number) =>
    loadedFrom > 0 && page >= loadedFrom && page <= loadedUpTo;
  const { hidden } = useScrollHide();
  const [showMorePopover, setShowMorePopover] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setShowMorePopover(false);
      onPageChange(page);
    },
    [currentPage, onPageChange, totalPages],
  );

  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  // ── Visible page buttons ─────────────────────────────────────────────────
  // Mostramos hasta 5 botones. Si total_pages > 5 el quinto será "..." con popover.
  const MAX_VISIBLE = 5;
  let pagesToShow: number[] = [];

  if (totalPages <= MAX_VISIBLE) {
    // Todas caben: mostrarlas todas
    pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Ventana deslizante de 4 alrededor de la actual, la última es el popover
    const half = 2;
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages - 1, start + 3); // max 4 botones normales
    if (end - start < 3) start = Math.max(1, end - 3);

    for (let p = start; p <= end; p++) pagesToShow.push(p);
  }

  const showMoreButton = totalPages > MAX_VISIBLE;
  // Páginas que irán en el popover (todas excepto las visibles y la última ya en popover)
  const popoverPages = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter((p) => !pagesToShow.includes(p));

  if (totalPages === 0) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 w-full h-14 z-50 px-2
        flex items-center justify-center gap-1
        transition-transform duration-300
        ${hidden ? "translate-y-full" : "translate-y-0"}
      `}
    >
      {/* ← Prev */}
      <Arrow
        onClick={prev}
        disabled={currentPage <= 1}
        arial_label="Página anterior"
        icon="mingcute:left-fill"
      />

      {/* Page buttons */}
      {pagesToShow.map((page) => (
        <PageButton
          key={page}
          page={page}
          isActive={page === currentPage}
          onClick={() => goToPage(page)}
        />
      ))}

      {/* More pages button → PopoverRef */}
      {showMoreButton && (
        <>
          <button
            ref={moreButtonRef}
            onClick={() => setShowMorePopover((v) => !v)}
            aria-label="Más páginas"
            className="
              flex items-center justify-center
              w-9 h-9 rounded-lg text-sm font-bold
              shadow-md shadow-gray-400 dark:shadow-gray-700
              text-label surface-interactive border
            "
          >
            <Icon icon="mingcute:more-1-fill" className="text-base" />
          </button>

          <PopoverRef
            open={showMorePopover}
            onClose={() => setShowMorePopover(false)}
            anchorRef={moreButtonRef}
            className="flex flex-col p-2 max-h-72 overflow-y-auto w-28"
          >
            {popoverPages.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`
                  popover-option justify-between
                  ${page === currentPage ? "bg-raised font-semibold" : ""}
                `}
              >
                <span>Pág. {page}</span>
                {isInCache(page) && (
                  <Icon
                    icon="mingcute:check-fill"
                    className="text-xs text-second"
                  />
                )}
              </button>
            ))}
          </PopoverRef>
        </>
      )}

      {/* → Next */}
      <Arrow
        onClick={next}
        disabled={currentPage >= totalPages}
        arial_label="Página siguiente"
        icon="mingcute:right-fill"
      />
    </div>
  );
}

interface ArrowProps {
  disabled: boolean;
  onClick: () => void;
  icon: string;
  arial_label: string;
}

const Arrow = ({ disabled, onClick, icon, arial_label }: ArrowProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={arial_label}
      className="
        flex items-center justify-center w-9 h-9 rounded-lg
        text-label surface-interactive border
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:pointer-events-none
      "
    >
      <Icon icon={icon} className="text-xl" />
    </button>
  );
};

interface PageButtonProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
}

function PageButton({ page, isActive, onClick }: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`
        flex items-center justify-center
        w-9 h-9 rounded-lg text-sm font-bold
        shadow-md shadow-gray-400 dark:shadow-gray-700
        ${
          isActive
            ? "bg-aurora text-white"
            : "text-label surface-interactive border"
        }
        transition-none
      `}
    >
      {page}
    </button>
  );
}
