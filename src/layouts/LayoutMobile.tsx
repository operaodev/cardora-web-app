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
    route: "/products",
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
      className="
        flex flex-col
        min-w-svw py-2 px-3 gap-2
        border-b border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
      "
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
            onClick={() => navigate(item.route)}
            className="popover-option"
          >
            <Icon icon={item.icon} className="text-3xl" />
            {item.title}
          </button>
        ))}
        <button
          onClick={toggleTheme}
          className="popover-option mt-auto mr-auto"
        >
          <Icon icon="fluent:dark-theme-24-filled" className="text-3xl" />
          Cambiar tema
        </button>
      </OverlayTransition>

      <div className="flex justify-between items-center gap-2">
        <Link to="/" className="text-aurora font-bold text-2xl mr-auto">
          Cardora
        </Link>

        <button
          ref={buttonRef}
          onClick={() => setShowAuth(true)}
          className="
            flex items-center justify-center
            text-gray-500 hover:text-gray-700
            transition duration-200
            dark:text-gray-400 dark:hover:text-gray-200
          "
        >
          <Icon icon="mingcute:user-4-fill" height={33} />
        </button>

        <button
          onClick={() => setShowMenu(true)}
          className="
            flex items-center justify-center w-7 h-7
            border border-gray-200 rounded-md
            text-gray-500 text-lg
            hover:bg-gray-100 hover:border-gray-300
            transition duration-200
            dark:border-gray-600 dark:text-gray-400
            dark:hover:bg-gray-700 dark:hover:border-gray-500
          "
        >
          <Icon icon="material-symbols:menu" />
        </button>
      </div>

      <SearchSuggestions />
    </div>
  );
}
