import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { OverlayTransition } from "@/components/modal/Overlay";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import AuthPopover from "./AuthPopover";
import SearchSuggestions from "@/layouts/SearchSuggestions";
import { useScrollHide } from "@/components/hooks/useScrollHide";

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
    route: "/inventory/me",
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

  // Active input detection for inhibit condition
  const [inputFocused, setInputFocused] = useState(false);

  const inhibit = showMenu || showAuth || inputFocused;
  const { hidden } = useScrollHide({ inhibit });

  // Track input focus for inhibit
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        setInputFocused(true);
      }
    };
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        setInputFocused(false);
      }
    };

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("blur", handleBlur, true);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div
      className={`
        sticky z-50 top-0
        flex flex-col
        w-full py-2 px-3 gap-2
        bg-surface border-b border-surface
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
            icon-interactive
          "
        >
          <Icon icon="mingcute:user-4-fill" height={33} />
        </button>

        <button
          onClick={() => setShowMenu(true)}
          className="
            flex items-center justify-center
            icon-interactive
          "
        >
          <Icon icon="material-symbols:menu" height={33} />
        </button>
      </div>

      <SearchSuggestions />
    </div>
  );
}
