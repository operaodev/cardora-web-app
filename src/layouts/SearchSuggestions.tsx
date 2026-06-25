import { useQuery } from "@tanstack/react-query";
import { type TCG, type LangCode } from "@/types/product";
import { randomNames } from "@/hooks/useProduct";
import { Icon } from "@iconify-icon/react";
import { useEffect, useRef, useState } from "react";
import { PopoverRef } from "../components/modal/Popover";
import type { SuggestionDTO, SuggestionInput } from "@/types/suggestion";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (search.trim()) {
          const params = new URLSearchParams();
          params.set("q", search.trim());
          if (lang.trim()) params.set("lang", lang.trim());
          if (game.trim()) params.set("game", game.trim());

          navigate(`marketplace?${params.toString()}`);
          setShowSuggestions(false);
        }
      }}
      className="
        relative flex items-center
        gap-2 px-3 py-1.5 rounded-lg
        bg-muted border border-surface focus-within:border-strong transition-colors
      "
    >
      <Icon icon="material-symbols:search" className="text-subtle shrink-0" />
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
          text-label placeholder:text-subtle
        "
      />
      {shouldShow && (
        <div
          className="
          overflow-hidden absolute left-0 right-0 top-full z-50 mt-1
          surface rounded-xl shadow-lg border border-surface
          flex flex-col
          "
        >
          {isFetching ? (
            <div className="px-5 py-6 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-raised border-t-strong rounded-full animate-spin" />
              <span className="text-sm text-subtle">Buscando...</span>
            </div>
          ) : hasResults && suggestions ? (
            <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-200 dark:divide-gray-700">
              {suggestions.map((s) => (
                <SuggestionRow key={s.id} suggestion={s} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-6 text-center text-sm text-subtle">
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
        text-second
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
                game === option.value ? "bg-raised font-semibold" : ""
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
          text-second
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
                lang === option.value ? "bg-raised font-semibold" : ""
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
    </form>
  );
}

const SuggestionRow = ({ suggestion }: { suggestion: SuggestionDTO }) => {
  const {
    id,
    type,
    code,
    set_region_code,
    set_name,
    set_external_id,
    name,
    image,
    rarity,
    rarity_code,
  } = suggestion;

  const isSet = type === "set";

  return (
    <Link
      to={`/products/${id}`}
      className="
        flex items-center
        gap-3 px-5 py-3
        bg-muted-interactive
        cursor-pointer
      "
    >
      {image ? (
        <img src={image} alt={name} className="w-12 h-16 object-contain" />
      ) : (
        <p
          className="
              flex items-center w-12 h-16
              bg-raised pointer-events-none
              text-xs font-semibold text-subtle text-center
            "
        >
          No image
        </p>
      )}
      <div className="flex flex-col min-w-0 gap-1">
        <h3 className="font-semibold text-sm text-heading truncate">
          {name}{" "}
          <span className="font-normal text-xs text-second">
            {!isSet && code && `(${code})`}
            {isSet && set_region_code && `(${set_region_code})`}
          </span>
        </h3>

        {rarity && (
          <p className="text-xs font-bold text-second">
            {rarity} {rarity_code && `(${rarity_code})`}
          </p>
        )}

        <p className="text-xs text-subtle">
          {isSet ? set_external_id : set_name}
        </p>
      </div>
    </Link>
  );
};
