import { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { OverlayTransition } from "../modal/Overlay";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useCreateStock } from "@/hooks/useStock";
import type { SuggestionDTO } from "@/types/suggestion";
import type { Condition } from "@/types/stock";
import type { TCG, LangCode } from "@/types/product";

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

interface CreateStockProps {
  open: boolean;
  onClose: () => void;
}

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "mint", label: "Mint" },
  { value: "near_mint", label: "Near Mint" },
  { value: "light_played", label: "Light Played" },
  { value: "mod_played", label: "Mod Played" },
  { value: "heavy_played", label: "Heavy Played" },
  { value: "damaged", label: "Damaged" },
];

const LANGS: { value: LangCode; label: string }[] = [
  { value: "EN", label: "EN" },
  { value: "SP", label: "SP" },
  { value: "FR", label: "FR" },
  { value: "DE", label: "DE" },
  { value: "IT", label: "IT" },
  { value: "PT", label: "PT" },
  { value: "JP", label: "JP" },
  { value: "KR", label: "KR" },
  { value: "TC", label: "TC" },
  { value: "SC", label: "SC" },
  { value: "AE", label: "AE" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CreateStock
// ─────────────────────────────────────────────────────────────────────────────

export const CreateStock = ({ open, onClose }: CreateStockProps) => {
  return (
    <OverlayTransition side="right" onClose={onClose} open={open}>
      <CreateStockForm />
    </OverlayTransition>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────────────────────

function CreateStockForm() {
  // ── Search state ───────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [tcgFilter] = useState<TCG>("ygo");
  const [langFilter, setLangFilter] = useState<LangCode>("EN");
  const [selectedProduct, setSelectedProduct] = useState<SuggestionDTO | null>(null);

  // ── Form fields ────────────────────────────────────────────
  const [condition, setCondition] = useState<Condition>("near_mint");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isForSale, setIsForSale] = useState(true);
  const [isForTrade, setIsForTrade] = useState(false);
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Hooks ──────────────────────────────────────────────────
  const { data: suggestions, isFetching } = useSuggestions(
    { tcg: tcgFilter, lang: langFilter, input: query },
    false,
  );

  const createStock = useCreateStock();

  // ── Handlers ───────────────────────────────────────────────
  const handleSelect = (s: SuggestionDTO) => {
    setSelectedProduct(s);
    setQuery(s.name);
    if (s.lang) setLangFilter(s.lang as LangCode);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    createStock.mutate(
      {
        product_id: selectedProduct.id,
        condition,
        quantity,
        price,
        is_for_sale: isForSale,
        is_for_trade: isForTrade,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            handleClear();
            setCondition("near_mint");
            setQuantity(1);
            setPrice(0);
            setIsForSale(true);
            setIsForTrade(false);
            setNote("");
          }, 1500);
        },
      },
    );
  };

  const showDropdown = query.length > 2 && !selectedProduct && suggestions && suggestions.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface shrink-0">
        <div>
          <h2 className="text-title font-bold text-base">Añadir al inventario</h2>
          <p className="text-content text-xs mt-0.5">Busca y registra una carta o set</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto scrollbar-surface p-5 gap-5">

        {/* ── Buscador de producto ─────────────────────────────── */}
        <section className="space-y-3">
          <Label icon="mdi:magnify">Producto</Label>

          {/* Lang filter */}
          <div className="flex gap-1.5 flex-wrap overflow-x-auto pb-0.5 scrollbar-surface">
            {LANGS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLangFilter(l.value)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${langFilter === l.value
                    ? "bg-aurora text-white border-transparent"
                    : "bg-raised text-content border-surface hover:border-content"
                  }
                `}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-raised border border-surface focus-within:border-indigo-400 dark:focus-within:border-fuchsia-500 transition-colors">
              {isFetching ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Icon icon="mdi:magnify" className="text-content text-lg shrink-0" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedProduct) setSelectedProduct(null);
                }}
                placeholder="Nombre, código o set…"
                className="flex-1 bg-transparent text-sm text-high placeholder:text-content outline-none"
              />
              {query && (
                <button type="button" onClick={handleClear} className="text-content hover:text-high transition-colors">
                  <Icon icon="mingcute:close-fill" className="text-base" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <ul className="absolute z-20 mt-1 w-full bg-surface border border-surface rounded-lg shadow-xl shadow-gray-300 dark:shadow-gray-950 overflow-hidden max-h-64 overflow-y-auto scrollbar-surface">
                {suggestions.map((s) => (
                  <SuggestionItem key={s.id} item={s} onSelect={handleSelect} />
                ))}
              </ul>
            )}

            {query.length > 2 && !isFetching && suggestions?.length === 0 && !selectedProduct && (
              <p className="mt-2 text-xs text-content text-center py-3">
                Sin resultados para "<span className="font-semibold">{query}</span>"
              </p>
            )}
          </div>

          {/* Selected product preview */}
          {selectedProduct && (
            <SelectedProductCard product={selectedProduct} onClear={handleClear} />
          )}
        </section>

        {/* ── Condición ───────────────────────────────────────── */}
        <section className="space-y-2 min-w-0">
          <Label icon="mdi:shield-star">Condición</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                className={`
                  py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors
                  ${condition === c.value
                    ? "bg-aurora text-white border-transparent"
                    : "bg-raised text-content border-surface hover:border-content"
                  }
                `}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Cantidad y precio ────────────────────────────────── */}
        <section className="space-y-3 min-w-0">
          <Label icon="icomoon-free:price-tag">Stock y precio</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-content font-medium">Cantidad</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="
                    w-8 h-8 flex items-center justify-center rounded-lg
                    font-bold text-label bg-raised hover:bg-raised
                    disabled:opacity-40 disabled:cursor-not-allowed
                    border border-surface transition-colors
                  "
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-base w-full text-center font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="
                    w-8 h-8 flex items-center justify-center rounded-lg
                    font-bold text-label bg-raised hover:bg-raised
                    border border-surface transition-colors
                  "
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-content font-medium">Precio (PEN)</p>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="input-base w-full"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {/* ── Disponibilidad ───────────────────────────────────── */}
        <section className="space-y-2 min-w-0">
          <Label icon="ion:switch-sharp">Disponibilidad</Label>
          <div className="flex gap-3">
            <ToggleChip
              label="Venta"
              icon="game-icons:sell-card"
              active={isForSale}
              onClick={() => setIsForSale((v) => !v)}
            />
            <ToggleChip
              label="Intercambio"
              icon="game-icons:card-exchange"
              active={isForTrade}
              onClick={() => setIsForTrade((v) => !v)}
            />
          </div>
        </section>

        {/* ── Nota ────────────────────────────────────────────── */}
        <section className="space-y-2 min-w-0">
          <Label icon="mdi:note-text">Nota (opcional)</Label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Añade una nota sobre este stock…"
            rows={2}
            className="input-base w-full resize-none"
          />
        </section>

        {/* ── Submit ──────────────────────────────────────────── */}
        <div className="mt-auto pt-4 border-t border-surface shrink-0">
          {success ? (
            <div className="w-full py-3 rounded-lg bg-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2">
              <Icon icon="mdi:check-circle" className="text-lg" />
              ¡Añadido al inventario!
            </div>
          ) : (
            <button
              type="submit"
              disabled={!selectedProduct || createStock.isPending}
              className="
                w-full btn-aurora
                flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {createStock.isPending && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {createStock.isPending ? "Guardando…" : "Añadir al inventario"}
            </button>
          )}

          {createStock.isError && (
            <p className="mt-2 text-xs text-red-500 text-center">
              Ocurrió un error. Intenta de nuevo.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Label({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-content uppercase tracking-wider">
      <Icon icon={icon} className="text-base text-special" />
      {children}
    </div>
  );
}

function SuggestionItem({
  item,
  onSelect,
}: {
  item: SuggestionDTO;
  onSelect: (s: SuggestionDTO) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-8 h-11 object-contain shrink-0 rounded" />
        ) : (
          <div className="w-8 h-11 bg-raised rounded flex items-center justify-center shrink-0">
            <Icon icon="game-icons:card-pick" className="text-content text-lg" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
          <p className="text-sm font-semibold text-high truncate">{item.name}</p>
          <p className="text-xs text-content truncate">
            {item.set_name ?? "—"}
            {item.rarity && ` · ${item.rarity}`}
            {item.code && ` · ${item.code}`}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-special font-semibold uppercase shrink-0">{item.type}</span>
            {item.lang && (
              <span className="text-[10px] text-subtle shrink-0">{item.lang}</span>
            )}
          </div>
        </div>
        {item.stock !== undefined && item.stock > 0 && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded">
            ×{item.stock}
          </span>
        )}
      </button>
    </li>
  );
}

function SelectedProductCard({
  product,
  onClear,
}: {
  product: SuggestionDTO;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl glass-aurora border border-indigo-200 dark:border-indigo-800">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-10 h-14 object-contain rounded shrink-0" />
      ) : (
        <div className="w-10 h-14 bg-raised rounded flex items-center justify-center shrink-0">
          <Icon icon="game-icons:card-pick" className="text-content text-2xl" />
        </div>
      )}
      <div className="flex-1 w-0 space-y-0.5">
        <p className="text-sm font-bold text-high truncate">{product.name}</p>
        <p className="text-xs text-content truncate">
          {product.set_name}{product.rarity && ` · ${product.rarity}`}
        </p>
        <div className="flex gap-1.5">
          {product.edition && (
            <span className="text-[10px] font-semibold text-special truncate">{product.edition}</span>
          )}
          {product.code && (
            <span className="text-[10px] text-subtle truncate">{product.code}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-subtle hover:text-high transition-colors shrink-0 p-1"
        title="Cambiar producto"
      >
        <Icon icon="mingcute:close-fill" className="text-lg" />
      </button>
    </div>
  );
}

function ToggleChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold
        transition-colors flex-1 justify-center
        ${active
          ? "bg-aurora text-white border-transparent"
          : "bg-raised text-content border-surface hover:border-content"
        }
      `}
    >
      <Icon icon={icon} className="text-base" />
      {label}
    </button>
  );
}
