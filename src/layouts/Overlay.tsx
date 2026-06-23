import { Icon } from "@iconify-icon/react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  open?: boolean;
  className?: string;
  side?: "left" | "right";
}

export const Overlay = ({ children, onClose }: Props) => {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg"
      onClick={onClose}
    >
      {children}
    </div>,
    document.body,
  );
};

export const OverlayTransition = ({
  open,
  onClose,
  children,
  side = "right",
  className,
}: Props) => {
  return createPortal(
    <div
      onClick={open ? onClose : undefined}
      className={`
        fixed inset-0 z-50
        flex items-center
        ${side === "left" ? "justify-start" : "justify-end"}
        transition-all duration-300
        ${
          open
            ? "bg-black/40 backdrop-blur-lg opacity-100 visible"
            : "bg-transparent opacity-0 invisible pointer-events-none"
        }
      `}
    >
      <div
        className={`
          flex items-center h-full max-w-3xl w-full
          ${side === "left" ? "flex-row-reverse" : "flex-row"}
        `}
      >
        <div
          className={`
            flex items-center justify-center p-4
            transition-transform duration-300
            ${
              side === "right"
                ? open
                  ? "translate-x-0"
                  : "translate-x-full"
                : open
                  ? "translate-x-0"
                  : "-translate-x-full"
            }
          `}
        >
          <button
            className="
              flex p-3 bg-gray-50 rounded-full shadow-md hover:bg-gray-200
              text-lg text-gray-500
              border border-gray-300 bevel-full
              transition-colors
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600
            "
            onClick={onClose}
          >
            <Icon icon="mingcute:close-fill" />
          </button>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            flex flex-col flex-1
            h-full
            bg-white shadow-xl
            transition-transform duration-300
            dark:bg-gray-800 dark:text-gray-100
            ${
              side === "right"
                ? open
                  ? "translate-x-0"
                  : "translate-x-full"
                : open
                  ? "translate-x-0"
                  : "-translate-x-full"
            }
            ${className}
          `}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};
