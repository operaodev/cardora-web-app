import { useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  open?: boolean;
  className?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  anchorPoint?: { x: number; y: number };
}

export const PopoverRef = ({
  children,
  onClose,
  open = true,
  className,
  anchorRef,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    if (!open || !ref.current || !anchorRef?.current) return;

    const el = ref.current;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const margin = 2;
    const offset = 2; // separación respecto al elemento que dispara el popover

    let top = anchorRect.bottom + offset;
    let left = anchorRect.left;

    // Si no entra hacia abajo, lo coloco arriba del elemento (sin tapar el botón)
    if (top + rect.height > window.innerHeight - margin) {
      top = anchorRect.top - rect.height - offset;
    }
    if (top < margin) {
      top = margin;
    }

    // Si no entra hacia la derecha, lo alineo a la derecha del elemento
    if (left + rect.width > window.innerWidth - margin) {
      left = anchorRect.right - rect.width;
    }
    if (left < margin) {
      left = margin;
    }

    setStyle({ top, left, opacity: 1 });
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          transition: "opacity 150ms ease",
          ...style,
        }}
        className={`
          bg-white rounded-xl shadow-lg border-200
          dark:bg-gray-800 dark:text-gray-100
          ${className}
        `}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const Popover = ({
  children,
  onClose,
  open = true,
  className,
  anchorPoint = { x: 0, y: 0 },
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    opacity: 0,
    top: anchorPoint.y,
    left: anchorPoint.x,
  });

  useLayoutEffect(() => {
    if (!open || !ref.current) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const offset = 8; // separación del punto de click

    let top = anchorPoint.y + offset;
    let left = anchorPoint.x;

    // Si no entra hacia abajo, lo mando hacia arriba del click
    if (top + rect.height > window.innerHeight - margin) {
      top = anchorPoint.y - rect.height - offset;
    }
    // Si tampoco entra arriba, lo clampeo dentro del viewport
    if (top < margin) {
      top = margin;
    }

    // Si no entra hacia la derecha, lo alineo hacia la izquierda del click
    if (left + rect.width > window.innerWidth - margin) {
      left = anchorPoint.x - rect.width;
    }
    if (left < margin) {
      left = margin;
    }

    setStyle({ top, left, opacity: 1 });
  }, [open, anchorPoint.x, anchorPoint.y]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          transition: "opacity 150ms ease",
          ...style,
        }}
        className={`
          bg-white rounded-xl shadow-lg
          dark:bg-gray-800 dark:text-gray-100
          ${className}
        `}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
