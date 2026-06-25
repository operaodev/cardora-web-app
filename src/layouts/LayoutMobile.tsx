import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { OverlayTransition } from "@/components/modal/Overlay";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import AuthPopover from "./AuthPopover";
import SearchSuggestions from "@/layouts/SearchSuggestions";

const NAV_ITEMS = [
  {
    title: "Inicio",
    icon: "material-symbols:home",
    route: "/",
    disabled: false,
  },
  {
    title: "Mercado",
    icon: "mdi:store",
    route: "/marketplace",
    disabled: false,
  },
  {
    title: "Mis cartas",
    icon: "game-icons:card-pick",
    route: "/inventory",
    disabled: true,
  },
];

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

export default function LayoutMobile() {
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isAuthenticated } = useUserStore();
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;

      // Evitar ocultar si el menú lateral, popover de auth o el input del buscador tienen interacción activa/foco
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA");

      if (showMenu || showAuth || isInputFocused) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      // Si está muy cerca del tope superior, mantenerlo siempre visible
      if (y < 40) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      const delta = y - lastY.current;

      // Umbral mínimo de scroll (10px) para evitar saltos y vibraciones
      if (Math.abs(delta) < 10) return;

      if (delta > 0 && y > 80) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }

      lastY.current = y;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [showMenu, showAuth]);

  return (
    <div
      className={`
        sticky z-50 top-0
        flex flex-col
        w-full py-2 px-3 gap-2
        border-b border-surface
        surface
        transition-transform duration-300
        ${hidden ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      {showAuth && (
        <AuthPopover
          open={showAuth}
          onClose={() => setShowAuth(false)}
          anchorRef={buttonRef}
        />
      )}

      <OverlayTransition
        open={showMenu}
        onClose={() => setShowMenu(false)}
        side="right"
        className="p-4"
      >
        {NAV_ITEMS.map((item, index) => (
          <button
            disabled={item.disabled && !isAuthenticated}
            key={index}
            onClick={() => {
              navigate(item.route);
              setShowMenu(false);
            }}
            className="popover-option"
          >
            <Icon icon={item.icon} className="text-2xl" />
            {item.title}
          </button>
        ))}
        <button
          onClick={toggleTheme}
          className="popover-option mt-auto mr-auto"
        >
          <Icon icon="fluent:dark-theme-24-filled" className="text-2xl" />
          Cambiar tema
        </button>
      </OverlayTransition>

      <div className="flex justify-between items-center gap-2">
        <Link to="/" className="text-aurora font-bold text-xl mr-auto">
          Cardora
        </Link>

        <button
          ref={buttonRef}
          onClick={() => setShowAuth(true)}
          className="
            flex items-center justify-center
            text-second hover:text-label
            transition duration-200
          "
        >
          <Icon icon="mingcute:user-4-fill" height={33} />
        </button>

        <button
          onClick={() => setShowMenu(true)}
          className="
            flex items-center justify-center w-7 h-7
            border-raised rounded-md
            text-second text-lg
            bg-raised
            transition duration-200
          "
        >
          <Icon icon="material-symbols:menu" />
        </button>
      </div>

      <SearchSuggestions />
    </div>
  );
}
