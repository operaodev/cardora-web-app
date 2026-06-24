import { useQuery } from "@tanstack/react-query";
import { type TCG, type LangCode } from "@/types/product";
import { randomNames } from "@/hooks/useProduct";
import { Icon } from "@iconify-icon/react";
import { useEffect, useRef, useState } from "react";
import { PopoverRef } from "../components/modal/Popover";
import type { SuggestionDTO, SuggestionInput } from "@/types/suggestion";
import { Link } from "react-router-dom";
import { useSuggestions } from "@/hooks/useSuggestions";

const GAME_OPTIONS: { value: TCG; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "ygo", label: "Yu-Gi-Oh!" },
];

const LANGUAGE_OPTIONS: { value: LangCode; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "EN", label: "English" },
  { value: "SP", label: "Español" },
  { value: "FR", label: "French" },
  { value: "DE", label: "Deutsch" },
  { value: "IT", label: "Italiano" },
  { value: "JP", label: "Japanese" },
  { value: "KR", label: "Korean" },
  { value: "AE", label: "Asian-English" },
  { value: "SC", label: "Chinese-Simplified" },
  { value: "TC", label: "Chinese-Traditional" },
];

export default function SearchSuggestions() {
  const [search, setSearch] = useState("");
  const [game, setGame] = useState<TCG>("");
  const [lang, setLang] = useState<LangCode>("");

  const [showGames, setShowGames] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const gameRef = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLButtonElement>(null);

  const [nameIndex, setNameIndex] = useState(0);

  const query: SuggestionInput = {
    input: search,
    tcg: game,
    lang: lang,
  };

  const { data: suggestions, isFetching } = useSuggestions(query);

  const hasResults = (suggestions?.length ?? 0) > 0;
  const shouldShow = showSuggestions && search.length > 2;

  const { data } = useQuery({
    queryKey: ["random-name"],
    queryFn: () => randomNames(10),
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (!data?.names?.length) return;
    const interval = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % data.names.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [data]);

  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    el.classList.remove("animate-placeholder-fade");
    void el.offsetWidth;
    el.classList.add("animate-placeholder-fade");
  }, [nameIndex]);

  const placeholder = data?.names?.[nameIndex]
    ? `Buscar ${data.names[nameIndex]}…`
    : "Buscar…";

  return (
    <div
      className="
        relative flex items-center
        gap-2 px-3 py-1.5 rounded-lg
        bg-gray-50 border border-gray-200 focus-within:border-gray-400 transition-colors
        dark:bg-gray-800 dark:border-gray-600 dark:focus-within:border-gray-500
      "
    >
      <Icon icon="material-symbols:search" className="text-400 shrink-0" />
      <input
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setShowSuggestions(false)}
        ref={searchRef}
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          flex-1 truncate bg-transparent outline-none
          text-700 placeholder-400
        "
      />
      {shouldShow && (
        <div
          className="
          absolute left-0 right-0 top-full z-50 mt-1
          surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
          flex flex-col divide-y divide-gray-200 dark:divide-gray-700
          "
        >
          {isFetching ? (
            <div className="px-5 py-6 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin dark:border-gray-600 dark:border-t-gray-300" />
              <span className="text-sm text-400">Buscando...</span>
            </div>
          ) : hasResults && suggestions ? (
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {suggestions.map((s) => (
                <SuggestionRow key={s.id} suggestion={s} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-6 text-center text-sm text-400">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}

      <span
        ref={gameRef}
        tabIndex={0}
        role="button"
        onClick={() => setShowGames(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowGames(true);
        }}
        className="
          uppercase cursor-pointer select-none rounded-md px-1.5 py-0.5 text-xs font-medium
          text-500
          focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
        "
      >
        {game || "ALL"}
      </span>
      {showGames && (
        <PopoverRef
          anchorRef={gameRef}
          open={showGames}
          onClose={() => setShowGames(false)}
          className="p-4 w-44 flex flex-col"
        >
          {GAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`popover-option ${
                game === option.value
                  ? "bg-gray-100 dark:bg-gray-700 font-semibold"
                  : ""
              }`}
              onClick={() => {
                setGame(option.value as TCG);
                setShowGames(false);
              }}
            >
              {option.label}
              {game === option.value && (
                <Icon icon="mdi:check-bold" className="ml-auto" />
              )}
            </button>
          ))}
        </PopoverRef>
      )}

      <span
        ref={langRef}
        tabIndex={0}
        role="button"
        onClick={() => setShowLangs(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowLangs(true);
        }}
        className="
          cursor-pointer select-none rounded-md px-1.5 py-0.5 text-xs font-medium
          text-500
          focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
        "
      >
        {lang || "ALL"}
      </span>
      {showLangs && (
        <PopoverRef
          anchorRef={langRef}
          open={showLangs}
          onClose={() => setShowLangs(false)}
          className="p-4 w-56 flex flex-col"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`popover-option ${
                lang === option.value
                  ? "bg-gray-100 dark:bg-gray-700 font-semibold"
                  : ""
              }`}
              onClick={() => {
                setLang(option.value as LangCode);
                setShowLangs(false);
              }}
            >
              {option.label}
              {lang === option.value && (
                <Icon icon="mdi:check-bold" className="ml-auto" />
              )}
            </button>
          ))}
        </PopoverRef>
      )}
    </div>
  );
}

const SuggestionRow = ({ suggestion }: { suggestion: SuggestionDTO }) => {
  const hasStock = (suggestion.stock ?? 0) > 0;
  const hasWishlist = (suggestion.copies_in_wishlist ?? 0) > 0;

  return (
    <Link
      to={`/products/${suggestion.id}`}
      className="flex items-center gap-4 px-5 py-3
        border-b border-gray-100 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-700/50
        transition-colors cursor-pointer"
    >
      {suggestion.image && (
        <img
          src={suggestion.image}
          alt={suggestion.name}
          className="w-12 h-16 object-contain rounded shrink-0"
        />
      )}
      <div className="flex flex-col min-w-0 gap-1 flex-1">
        <h3 className="font-semibold text-sm text-800 truncate">
          {suggestion.name}{" "}
          <span className="font-normal text-sm text-400">
            {suggestion.type === "card" &&
              suggestion.code &&
              `(${suggestion.code})`}
            {suggestion.type === "set" &&
              suggestion.set_code &&
              `(${suggestion.set_code})`}
          </span>
        </h3>
        {suggestion.rarity && (
          <p className="text-xs font-semibold text-aurora">
            {suggestion.rarity}{" "}
            {suggestion.rarity_code && `(${suggestion.rarity_code})`}
          </p>
        )}
        <span className="text-xs text-400">{suggestion.set_name}</span>
      </div>

      {/* Badges de stock / wishlist */}
      {(hasStock || hasWishlist) && (
        <div className="flex flex-col gap-2 shrink-0">
          {hasStock && (
            <span
              className="badge
                bg-blue-50 text-blue-600 border border-blue-200
                dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            >
              <Icon icon="icon-park-solid:stock-market" className="text-sm" />x
              {suggestion.stock}
            </span>
          )}
          {hasWishlist && (
            <span
              className="badge
                bg-yellow-50 text-yellow-500 border border-yellow-200
                dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
            >
              <Icon icon="clarity-favorite-solid" className="text-sm" />x
              {suggestion.copies_in_wishlist}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
