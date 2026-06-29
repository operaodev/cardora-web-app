import { Icon } from "@iconify-icon/react";
import { useScrollHide } from "@/components/hooks/useScrollHide";

interface Props {
  classname?: string;
  side?: "left" | "right";
  icon: string;
  onClick: () => void;
}

export default function ModalControl({ classname, onClick, icon, side = "left" }: Props) {
  const { hidden } = useScrollHide();

  return (
    <button
      onClick={onClick}
      className={`
        fixed w-10 h-40 z-40
        flex flex-col items-center justify-center
        text-content text-2xl
        surface-interactive border bevel-full
        shadow-md shadow-surface
        transition-transform duration-300
        ${
          side === "left"
            ? "left-0 border-l-0 rounded-tr-full rounded-br-full"
            : "right-0 border-r-0 rounded-tl-full rounded-bl-full"
        }
        ${
          hidden
            ? side === "left"
              ? "-translate-x-full"
              : "translate-x-full"
            : "translate-x-0"
        }
        ${classname}
      `}
    >
      <Icon icon={icon} />
    </button>
  );
}
