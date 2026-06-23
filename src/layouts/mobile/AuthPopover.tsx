import { PopoverRef } from "@/layouts/Popover";
import { useUserStore } from "@/stores/useUserStore";
import { Link } from "react-router-dom";
import { Icon } from "@iconify-icon/react";

const noAuthenticated = [
  { title: "Iniciar sesión", icon: "mdi:login", to: "/login" },
  { title: "Registrarse", icon: "mdi:register", to: "/register" },
  {
    title: "Iniciar como invitado",
    icon: "fluent:guest-24-filled",
    to: "/guest",
  },
];

const isGuest = [
  noAuthenticated[0],
  noAuthenticated[1],
  {
    title: "Verificar cuenta",
    icon: "fluent:guest-add-24-filled",
    to: "/guest/verify",
  },
];

const isUser = [
  { title: "Mi perfil", icon: "fluent:person-24-filled", to: "/profile" },
  { title: "Cerrar sesión", icon: "mdi:logout", to: "/logout" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function AuthPopover({ open, onClose, anchorRef }: Props) {
  const { isAuthenticated, user } = useUserStore();

  if (!isAuthenticated)
    return (
      <PopoverRef
        open={open}
        onClose={onClose}
        anchorRef={anchorRef}
        className="w-72 flex flex-col p-4"
      >
        {noAuthenticated.map((link) => {
          return (
            <Link key={link.title} to={link.to} className="popover-option">
              <Icon icon={link.icon} className="text-2xl" />
              {link.title}
            </Link>
          );
        })}
      </PopoverRef>
    );

  if (user?.is_guest)
    return (
      <PopoverRef
        open={open}
        onClose={onClose}
        anchorRef={anchorRef}
        className="w-72 flex flex-col p-4"
      >
        {isGuest.map((link) => {
          return (
            <Link key={link.title} to={link.to} className="popover-option">
              <Icon icon={link.icon} className="text-2xl" />
              {link.title}
            </Link>
          );
        })}
      </PopoverRef>
    );

  return (
    <PopoverRef
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      className="w-72 flex flex-col divide-y divide-gray-200 dark:divide-gray-700"
    >
      <div className="p-4">
        <h4 className="font-medium text-gray-800 dark:text-gray-100">Opera</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          opera@email.com
        </p>
      </div>
      <div className="flex flex-col p-4">
        {isUser.map((link) => {
          return (
            <Link key={link.title} to={link.to} className="popover-option">
              <Icon icon={link.icon} className="text-2xl" />
              {link.title}
            </Link>
          );
        })}
      </div>
    </PopoverRef>
  );
};