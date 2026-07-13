import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import ModalControl from "@/components/controls/ModalControl";
import { OverlayTransition, Overlay } from "@/components/modal/Overlay";
import PageContainer from "@/components/containers/PageContainer";
import { useInfiniteMyStock, useMyStockFilters, useDeleteStock } from "@/hooks/useStock";
import type { FilterInput, Stock } from "@/types/stock";
import { CreateStock } from "@/components/inventory/inventory";
import { StockCard } from "@/components/inventory/StockCard";
import { useExportStockImages } from "@/hooks/useExportStockImages";

// ─────────────────────────────────────────────────────────────────────────────
// Inventory page
// ─────────────────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [startPage, setStartPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStockIds, setSelectedStockIds] = useState<number[]>([]);

  const { exportImages, isExporting } = useExportStockImages();
  const deleteStock = useDeleteStock();

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedStockIds) {
        await deleteStock.mutateAsync(id);
      }
      setSelectedStockIds([]);
      setIsEditMode(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      alert("Hubo un error al eliminar los elementos.");
    }
  };

  // Filtros activos
  const [filters, setFilters] = useState<FilterInput>({});

  const filterInput: FilterInput = { ...filters, page: startPage, limit: 20 };
  const infiniteQuery = useInfiniteMyStock(filterInput);

  const stocks = infiniteQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const selectedStocks = stocks.filter((s) => selectedStockIds.includes(s.id));
  const total = infiniteQuery.data?.pages[0]?.total ?? 0;

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  const handleFilterChange = (patch: Partial<FilterInput>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setStartPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setStartPage(1);
  };

  const handleSelectCard = (id: number) => {
    setSelectedStockIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Estados vacío / error / carga inicial ─────────────────────────────────
  if (infiniteQuery.isLoading && stocks.length === 0) {
    return (
      <main className="flex-1 py-3">
        <InventoryLoading />
      </main>
    );
  }

  if (infiniteQuery.isError) {
    return <InventoryError />;
  }

  if (!infiniteQuery.isLoading && total === 0 && activeCount === 0) {
    return <InventoryEmpty />;
  }

  return (
    <main className="flex-1 py-3">
      {/* ── Botón de Cámara (Solo en Edit Mode) ─────────────────────── */}
      <ModalControl
        onClick={() => {
          if (selectedStocks.length === 0) {
            alert("Por favor selecciona al menos una carta para exportar.");
            return;
          }
          exportImages(selectedStocks);
        }}
        icon={isExporting ? "line-md:loading-twotone-loop" : "mdi:camera"}
        side="left"
        forceHide={!isEditMode}
      />

      {/* ── Botón Eliminar Lote (Solo en Edit Mode) ───────── */}
      <ModalControl
        onClick={() => {
          if (selectedStockIds.length === 0) {
            alert("Por favor selecciona al menos una carta para eliminar.");
            return;
          }
          setShowDeleteConfirm(true);
        }}
        icon="mdi:trash-can-outline"
        side="right"
        classname="bottom-20 text-red-500 hover:text-red-600"
        forceHide={!isEditMode}
      />

      {/* ── Modal Confirmar Eliminación ───────── */}
      {showDeleteConfirm && (
        <Overlay onClose={() => setShowDeleteConfirm(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-surface p-6 rounded-2xl shadow-xl max-w-md w-[90%] space-y-4"
          >
            <h3 className="text-xl font-bold text-title">¿Eliminar cartas?</h3>
            <p className="text-content text-sm">
              ¿Estás seguro de que deseas eliminar las {selectedStockIds.length} cartas seleccionadas? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-raised hover:bg-raised/80 text-title font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleteStock.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {deleteStock.isPending ? "Eliminando..." : "Aceptar"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Botón de Cancelar / Cerrar Edit (Solo en Edit Mode) ───────── */}
      <ModalControl
        onClick={() => {
          setIsEditMode(false);
          setSelectedStockIds([]);
        }}
        icon="mdi:close"
        side="left"
        classname="bottom-20 pl-1"
        forceHide={!isEditMode}
      />

      {/* ── Botón de Entrar a Edit Mode (Solo en Normal Mode) ───────── */}
      <ModalControl
        onClick={() => setIsEditMode(true)}
        icon="mdi:edit"
        side="left"
        classname="bottom-20 pl-1"
        forceHide={isEditMode}
      />

      {/* ── Botón añadir carta (Solo en Normal Mode) ────────────────── */}
      <ModalControl
        onClick={() => setShowCreate(true)}
        icon="streamline-ultimate:card-add-1-bold"
        side="right"
        classname="bottom-20 pl-1"
        forceHide={isEditMode}
      />
      <CreateStock open={showCreate} onClose={() => setShowCreate(false)} />

      {/* ── Botón filtros + badge (Solo en Normal Mode) ─────────────── */}
      <ModalControl
        onClick={() => setShowFilter(true)}
        icon="mdi:filter"
        forceHide={isEditMode}
      />
      <OverlayTransition
        side="left"
        onClose={() => setShowFilter(false)}
        open={showFilter}
      >
        <FilterPanel
          filters={filters}
          searchInput={filters.input ?? ""}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          onClose={() => setShowFilter(false)}
        />
      </OverlayTransition>

      {/* ── Encabezado con total + chips de filtros activos ───────── */}
      <div className="w-11/12 mx-auto mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-title font-bold text-lg">
            {isEditMode ? "Seleccionar cartas" : "Mi Inventario"}
          </h1>
          {isEditMode ? (
            <span className="text-special text-sm font-semibold animate-pulse">
              {selectedStockIds.length} seleccionadas
            </span>
          ) : (
            total > 0 && (
              <span className="text-content text-sm">
                {total} {total === 1 ? "carta" : "cartas"}
              </span>
            )
          )}
        </div>

        {/* Active filter chips */}
        {!isEditMode && activeCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, val]) => {
              if (!val || val === "") return null;
              const labels: Record<string, string> = {
                input: "Búsqueda",
                type: "Tipo",
                tcg: "TCG",
                lang: "Idioma",
                set_name: "Set",
                archetype: "Arquetipo",
                rarity: "Rareza",
                edition: "Edición",
              };
              return (
                <button
                  key={key}
                  onClick={() =>
                    handleFilterChange({
                      [key]: undefined,
                    } as Partial<FilterInput>)
                  }
                  className="
                    flex items-center gap-1 px-3 py-1
                    bg-tag text-tag text-xs font-semibold
                    rounded-full transition-opacity hover:opacity-70
                  "
                >
                  <span>
                    {labels[key] ?? key}: {val}
                  </span>
                  <Icon icon="mingcute:close-fill" className="text-base" />
                </button>
              );
            })}
            <button
              onClick={handleClearFilters}
              className="text-xs text-content underline underline-offset-2 ml-1"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Empty filtered state */}
        {!infiniteQuery.isLoading && total === 0 && activeCount > 0 && (
          <div className="text-center py-12 space-y-3">
            <Icon
              icon="game-icons:card-pick"
              className="text-gray-300 mx-auto text-[5rem]"
            />
            <p className="text-content text-sm">
              Ninguna carta coincide con los filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* ── Lista paginada ─────────────────────────────────────────── */}
      {total > 0 && (
        <PageContainer<Stock>
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-11/12 mx-auto"
          data={infiniteQuery.data}
          isLoading={infiniteQuery.isLoading}
          isFetchingNextPage={infiniteQuery.isFetchingNextPage}
          isFetchingPreviousPage={infiniteQuery.isFetchingPreviousPage}
          hasNextPage={infiniteQuery.hasNextPage}
          hasPreviousPage={infiniteQuery.hasPreviousPage}
          fetchNextPage={infiniteQuery.fetchNextPage}
          fetchPreviousPage={infiniteQuery.fetchPreviousPage}
          onJumpToPage={setStartPage}
          renderItem={(item) => (
            <StockCard
              key={item.id}
              item={item}
              isSelectable={isEditMode}
              isSelected={selectedStockIds.includes(item.id)}
              onSelect={() => handleSelectCard(item.id)}
            />
          )}
          renderSkeleton={(key) => <StockSkeleton key={key} />}
        />
      )}


    </main>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FilterPanel
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterInput;
  searchInput: string;
  onFilterChange: (patch: Partial<FilterInput>) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterPanel({
  filters,
  searchInput,
  onFilterChange,
  onClear,
  onClose,
}: FilterPanelProps) {
  const [draft, setDraft] = useState(filters.input ?? "");

  const { data: available, isLoading: loadingFilters } =
    useMyStockFilters(searchInput);

  const handleSelect = (key: keyof FilterInput, val: string) =>
    onFilterChange({ [key]: val || undefined });

  // Debounce: commit 500 ms después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ input: draft.trim() || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearSearch = () => {
    setDraft("");
    onFilterChange({ input: undefined });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface">
        <h2 className="text-title font-bold text-base">Filtros</h2>
        <button
          onClick={onClear}
          className="text-xs text-content underline underline-offset-2"
        >
          Limpiar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-surface p-5 space-y-4">
        {/* Búsqueda */}
        <div className="space-y-1.5">
          <label className="text-xs text-content font-semibold uppercase tracking-wider">
            Búsqueda
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-raised border border-surface focus-within:border-indigo-400 dark:focus-within:border-fuchsia-500 transition-colors">
            <Icon icon="mdi:magnify" className="text-content text-lg shrink-0" />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nombre, código o set…"
              className="flex-1 bg-transparent text-sm text-high placeholder:text-content outline-none"
            />
            {draft && (
              <button type="button" onClick={handleClearSearch}>
                <Icon icon="mingcute:close-fill" className="text-content text-base" />
              </button>
            )}
          </div>
        </div>

        {loadingFilters ? (
          <FilterSkeleton />
        ) : (
          <>
            <FilterSelect
              label="TCG"
              options={available?.tcg ?? []}
              value={filters.tcg ?? ""}
              onChange={(v) => handleSelect("tcg", v)}
            />
            <FilterSelect
              label="Tipo"
              options={available?.type ?? []}
              value={filters.type ?? ""}
              onChange={(v) => handleSelect("type", v)}
            />
            <FilterSelect
              label="Idioma"
              options={available?.lang ?? []}
              value={filters.lang ?? ""}
              onChange={(v) => handleSelect("lang", v)}
            />
            <FilterSelect
              label="Set"
              options={available?.set_name ?? []}
              value={filters.set_name ?? ""}
              onChange={(v) => handleSelect("set_name", v)}
            />
            <FilterSelect
              label="Rareza"
              options={available?.rarity ?? []}
              value={filters.rarity ?? ""}
              onChange={(v) => handleSelect("rarity", v)}
            />
            <FilterSelect
              label="Arquetipo"
              options={available?.archetype ?? []}
              value={filters.archetype ?? ""}
              onChange={(v) => handleSelect("archetype", v)}
            />
            <FilterSelect
              label="Edición"
              options={available?.edition ?? []}
              value={filters.edition ?? ""}
              onChange={(v) => handleSelect("edition", v)}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-surface">
        <button
          onClick={onClose}
          className="w-full btn-aurora"
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterSelect — select nativo por campo de filtro
// ─────────────────────────────────────────────────────────────────────────────

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (!options.length) return null;
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-content font-semibold uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full appearance-none
            px-3 py-2 pr-8 rounded-lg
            bg-raised border border-surface
            text-sm text-high
            focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-fuchsia-500 focus:border-transparent
            transition duration-200
            capitalize
          "
        >
          <option value="">Todos</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Icon
          icon="mdi:chevron-down"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-content text-lg pointer-events-none"
        />
      </div>
    </div>
  );
}

// StockCard is imported from @/components/inventory/StockCard

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons & estados
// ─────────────────────────────────────────────────────────────────────────────

function StockSkeleton() {
  return (
    <div className="flex h-28 card-surface rounded-xl gap-4 p-4 border border-surface animate-pulse">
      <div className="aspect-475/696 h-full bg-raised rounded shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <div className="h-3 bg-raised rounded w-3/4" />
          <div className="h-3 bg-raised rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-8 bg-raised rounded" />
          <div className="h-4 w-8 bg-raised rounded" />
        </div>
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-raised rounded w-16" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-raised rounded-full" />
            <div className="h-6 w-20 bg-raised rounded-full" />
            <div className="h-6 w-14 bg-raised rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

const InventoryEmpty = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="m-auto text-center space-y-6 max-w-sm">
      <Icon
        icon="game-icons:card-pick"
        className="text-subtle mx-auto text-[7rem]"
      />
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-title text-balance">
          Tu inventario está vacío
        </h1>
        <p className="text-sm text-content leading-relaxed">
          Añade cartas o sets a tu colección para empezar a gestionar tu stock,
          crear ofertas y mucho más.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-aurora rounded-lg"
      >
        Añade tu primera carta
      </button>
      <CreateStock open={showCreate} onClose={() => setShowCreate(false)} />
    </main>
  );
};

const InventoryError = () => (
  <main className="m-auto text-center space-y-6 max-w-sm">
    <Icon
      icon="game-icons:card-discard"
      className="text-subtle mx-auto text-[7rem]"
    />
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-title">Algo salió mal</h1>
      <p className="text-sm text-content leading-relaxed px-5">
        Ha ocurrido un error al cargar tu inventario. Verifica tu conexión a
        internet o intenta de nuevo.
      </p>
    </div>
  </main>
);

const InventoryLoading = () => (
  <div className="w-11/12 mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <StockSkeleton key={i} />
    ))}
  </div>
);
