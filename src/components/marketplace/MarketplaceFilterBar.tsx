import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";

const CONDITIONS = [
  { label: "Mint", value: "mint" },
  { label: "Near Mint", value: "near_mint" },
  { label: "Lightly Played", value: "light_played" },
  { label: "Moderately Played", value: "mod_played" },
  { label: "Heavily Played", value: "heavy_played" },
  { label: "Damaged", value: "damaged" },
];
const RARITIES = ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare"];
const CARD_TYPES = ["Monster", "Spell", "Trap"];
const PRODUCT_TYPES = [{ label: "Cartas", value: "card" }, { label: "Booster Pack/Set", value: "set" }];
const LANGUAGES = [{ label: "Inglés", value: "EN" }, { label: "Español", value: "SP" }, { label: "Japonés", value: "JP" }];
const AVAILABILITIES = [{ label: "Venta", value: "sale" }, { label: "Intercambio", value: "trade" }, { label: "Ambos", value: "both" }];

export default function MarketplaceFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    const q = searchParams.get("q");
    setSearchParams(q ? { q } : {});
  };

  // UI state for price range so we don't update URL on every keystroke
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const applyPriceFilter = () => {
    if (minPrice) searchParams.set("min_price", minPrice);
    else searchParams.delete("min_price");

    if (maxPrice) searchParams.set("max_price", maxPrice);
    else searchParams.delete("max_price");

    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-surface border-b border-surface">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-auto gap-2 font-semibold text-sm text-title md:mr-2 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Icon icon="mdi:filter-variant" className="text-lg" />
          Filtros
        </div>
        <Icon icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} className="text-lg md:hidden text-subtle" />
      </button>

      <div className={`w-full md:w-auto flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 flex-1 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("condition") || ""}
          onChange={(e) => handleSelect("condition", e.target.value)}
        >
          <option value="">Condición</option>
          {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("product_type") || ""}
          onChange={(e) => handleSelect("product_type", e.target.value)}
        >
          <option value="">Producto</option>
          {PRODUCT_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("card_type") || ""}
          onChange={(e) => handleSelect("card_type", e.target.value)}
        >
          <option value="">Tipo de Carta</option>
          {CARD_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("rarity") || ""}
          onChange={(e) => handleSelect("rarity", e.target.value)}
        >
          <option value="">Rareza</option>
          {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("lang") || ""}
          onChange={(e) => handleSelect("lang", e.target.value)}
        >
          <option value="">Idioma</option>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        <select
          className="w-full md:w-auto bg-raised text-sm rounded-lg px-3 py-2 md:py-1.5 border border-surface text-content focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={searchParams.get("availability") || ""}
          onChange={(e) => handleSelect("availability", e.target.value)}
        >
          <option value="">Disponibilidad</option>
          {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>

        <div className="w-full md:w-auto flex items-center justify-between gap-2 bg-raised rounded-lg px-3 py-2 md:px-2 md:py-1 border border-surface focus-within:ring-1 focus-within:ring-indigo-500">
          <span className="text-xs font-semibold text-subtle">S/.</span>
          <input
            type="number"
            placeholder="Mín"
            step="0.01"
            min="0"
            className="flex-1 w-full md:w-16 bg-transparent text-sm text-content outline-none text-center"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
          />
          <span className="text-subtle">-</span>
          <input
            type="number"
            placeholder="Máx"
            step="0.01"
            min="0"
            className="flex-1 w-full md:w-16 bg-transparent text-sm text-content outline-none text-center"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
          />
        </div>

        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors md:ml-auto mt-2 md:mt-0 text-left md:text-right"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
