// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { Overlay } from "../modal/Overlay";
import type { Stock, Log } from "@/types/stock";
import type { Product } from "@/types/product";
import { useCardsBySet } from "@/hooks/useProduct";
import {
  useToggleForSale,
  useToggleForTrade,
  useUpdatePrice,
  useAdjustStock,
  useRestock,
  useSale,
  useTrade,
  useGift,
  useLost,
  useDamage,
  useReturnStock,
  useOpenBox,
  useStockLogs,
  useRollback,
} from "@/hooks/useStock";

import { forwardRef, useImperativeHandle } from "react";

interface CardListProps {
  cards: Product[];
  multiplier: number;
  setExternalId: string;
  lang: string;
}

export interface CardListItemQty {
  product: {
    id: number;
    name: string;
    set_external_id: string;
    lang: string;
    code?: string;
  };
  quantity: number;
}

export interface CardListRef {
  getQuantities: () => CardListItemQty[];
}

function displayRarity(card: Product): string {
  const parts = [card.rarity, card.rarity_code ? `(${card.rarity_code})` : null]
    .filter(Boolean)
    .join(" ");
  return parts || "-";
}

export const CardList = forwardRef<CardListRef, CardListProps>(
  ({ cards, multiplier, setExternalId, lang }, ref) => {
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    useImperativeHandle(ref, () => ({
      getQuantities: () => {
        return cards
          .map((card) => {
            const qty =
              quantities[card.id] ?? card.quantity_per_set * multiplier;
            if (qty === 0) return null;
            return {
              product: {
                id: card.id,
                name: card.name,
                set_external_id: setExternalId,
                lang: lang,
                code: card.code,
              },
              quantity: qty,
            } as CardListItemQty;
          })
          .filter(Boolean) as CardListItemQty[];
      },
    }));

    if (cards.length === 0) {
      return <p className="text-xs text-gray-400 italic">Sin cartas</p>;
    }

    const getQty = (card: Product): number => {
      if (quantities[card.id] !== undefined) {
        return quantities[card.id];
      }
      return card.quantity_per_set * multiplier;
    };

    const isBonus = (card: Product) => card.quantity_per_set === 0;

    const maxQty = (card: Product): number => {
      if (isBonus(card)) return Infinity;
      return card.quantity_per_set * multiplier;
    };

    const canDecrease = (card: Product) => {
      if (isBonus(card)) return getQty(card) > 0;
      return getQty(card) > 0;
    };

    const canIncrease = (card: Product) => {
      return getQty(card) < maxQty(card);
    };

    const changeQty = (card: Product, delta: number) => {
      const current = getQty(card);
      const next = current + delta;
      if (next < 0) return;
      if (!isBonus(card) && next > maxQty(card)) return;

      const defaultValue = card.quantity_per_set * multiplier;
      if (next === defaultValue) {
        setQuantities((prev) => {
          const next = { ...prev };
          delete next[card.id];
          return next;
        });
      } else {
        setQuantities((prev) => ({ ...prev, [card.id]: next }));
      }
    };

    return (
      <ul className="space-y-1">
        {cards.map((card) => {
          const qty = getQty(card);
          const edited = quantities[card.id] !== undefined;

          return (
            <li
              key={card.id}
              className={`flex items-center justify-between px-3 py-1.5 text-xs
              rounded-md hover:bg-gray-50 transition-colors
              ${edited ? "bg-blue-50/50" : ""}`}
            >
              <div className="flex-1 min-w-0 mr-2">
                <span className="font-medium text-gray-700 truncate block">
                  {card.name}
                </span>
                <span className="text-gray-400">
                  {card.code} · {displayRarity(card)}
                </span>
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => changeQty(card, -1)}
                  disabled={!canDecrease(card)}
                  className="w-5 h-5 flex items-center justify-center text-xs
                  text-gray-500 bg-gray-100 rounded
                  hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed
                  transition-colors"
                >
                  <Icon icon="mdi:minus" className="text-xs" />
                </button>

                <span
                  className={`text-xs font-semibold min-w-[2ch] text-center tabular-nums
                  ${edited ? "text-blue-600" : "text-gray-500"}`}
                  title={edited ? "Modificado" : undefined}
                >
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() => changeQty(card, 1)}
                  disabled={!canIncrease(card)}
                  className="w-5 h-5 flex items-center justify-center text-xs
                  text-gray-500 bg-gray-100 rounded
                  hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed
                  transition-colors"
                >
                  <Icon icon="mdi:plus" className="text-xs" />
                </button>

                {/* Reset button */}
                {edited && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuantities((prev) => {
                        const next = { ...prev };
                        delete next[card.id];
                        return next;
                      });
                    }}
                    className="w-5 h-5 flex items-center justify-center text-[10px]
                    text-blue-500 hover:text-blue-700 transition-colors"
                    title="Restaurar cantidad por defecto"
                  >
                    <Icon icon="mdi:restore" className="text-xs" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// StockCard
// ─────────────────────────────────────────────────────────────────────────────

interface StockProps {
  item: Stock;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const StockCard = ({ item, isSelectable = false, isSelected = false, onSelect }: StockProps) => {
  const [showModal, setShowModal] = useState(false);

  const {
    product,
    quantity,
    is_for_sale,
    is_for_trade,
    price,
    discount_price,
    condition,
  } = item;
  const {
    name,
    lang,
    set_name,
    code,
    rarity,
    rarity_code,
    edition,
    type,
    set_type,
    set_code,
    set_region_code,
    print_url_large,
    set_image_large,
    images,
  } = product;

  const displayCondition = condition.replaceAll("_", " ");
  const displayName =
    name +
    (type === "card" && code
      ? ` (${code})`
      : set_code
        ? ` (${set_region_code})`
        : "");
  const print = [rarity, rarity_code && `(${rarity_code})`, edition && `- ${edition}`]
    .filter(Boolean)
    .join(" ");

  const cardImage = print_url_large || images?.[0].image_url;

  const hasDiscount = discount_price > 0 && discount_price < price;

  return (
    <div
      className={`
        relative overflow-hidden
        flex flex-col
        gap-4 p-5
        card-surface border rounded-lg
        cursor-pointer
        transition-all duration-200
        ${
          isSelected
            ? "border-indigo-500 dark:border-fuchsia-500 ring-2 ring-indigo-500/20 dark:ring-fuchsia-500/20 scale-102"
            : ""
        }
      `}
      onClick={() => {
        if (isSelectable && onSelect) {
          onSelect();
        } else {
          setShowModal(true);
        }
      }}
    >
      <StockActionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        stock={item}
      />

      {isSelectable && (
        <div
          className={`
            absolute top-2 right-2 rounded-full p-1 z-10 flex items-center justify-center w-6 h-6 shadow transition-all duration-200
            ${
              isSelected
                ? "bg-indigo-500 dark:bg-fuchsia-500 text-white scale-110"
                : "bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-600 text-transparent"
            }
          `}
        >
          <Icon icon="mdi:check" className="text-sm font-bold" />
        </div>
      )}

      {!isSelectable && (
        <div
          className="
            absolute z-2 opacity-0
            hover:opacity-100
            flex items-center justify-center
            w-full h-full inset-0
            text-5xl text-indigo-400
            bg-linear-to-t from-40% from-indigo-100/60 dark:from-indigo-950/60 to-transparent
            transition-opacity duration-300
          "
        >
          <Icon icon="game-icons:card-play" />
        </div>
      )}

      <div className="relative w-full aspect-475/696">
        <img
          className="absolute inset-0 w-full h-full object-contain"
          src={type === "card" ? cardImage : set_image_large}
          alt={name}
        />
      </div>

      <div className="flex gap-1 -my-1">
        {[lang, displayCondition].map((badge, index) => (
          <div
            key={index}
            className="
              px-2 py-0.5
              border border-indigo-500 dark:border-fuchsia-500 rounded-md
              text-indigo-500 dark:text-fuchsia-400 capitalize text-xs font-semibold
            "
          >
            {badge}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {type === "card" ? (
          <div className="text-sm space-y-1">
            <p className="text-content">{set_name}</p>
            <p className="text-special font-semibold">
              {print}
            </p>
          </div>
        ) : (
          <div className="text-xs space-y-1">
            <p className="text-content capitalize">{set_type}</p>
            <p className="text-special font-semibold">{`${set_code} - ${set_region_code}`}</p>
          </div>
        )}
        <h3 className="font-semibold text-high text-base">{displayName}</h3>
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <div className="ml-auto flex items-baseline gap-1.5">
          {hasDiscount ? (
            <>
              <span className="text-content text-sm font-bold">
                {discount_price.toFixed(2)} PEN
              </span>
              <span className="text-subtle text-xs line-through">
                {price.toFixed(2)} PEN
              </span>
            </>
          ) : (
            <span className="text-content text-sm font-bold">
              {price.toFixed(2)} PEN
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center text-content text-2xl gap-2">
            <Icon
              icon="game-icons:sell-card"
              className={`${!is_for_sale && "text-muted"}`}
              title={is_for_sale ? "Vendible" : "No vendible"}
            />
            <Icon
              icon="game-icons:card-exchange"
              className={`${!is_for_trade && "text-muted"}`}
              title={is_for_trade ? "Intercambiable" : "No intercambiable"}
            />
          </div>
          <span className="text-content font-semibold" title="Unidades">
            {quantity > 0 ? `x${quantity}` : "Sin stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StockActionsModal
// ─────────────────────────────────────────────────────────────────────────────

interface StockActionsModalProps {
  open?: boolean;
  onClose: () => void;
  stock: Stock;
}

function StockActionsModal({ open, onClose, stock }: StockActionsModalProps) {
  return open && stock ? (
    <StockActionsModalContent stock={stock} onClose={onClose} />
  ) : null;
}

const StockActionsModalContent = ({
  stock,
  onClose,
}: {
  stock: Stock;
  onClose: () => void;
}) => {
  const { product, condition, quantity } = stock;
  const {
    name,
    code,
    type,
    set_name,
    set_region_code,
    rarity,
    rarity_code,
    lang,
    id,
    edition,
    set_type,
  } = product;

  const navigate = useNavigate();
  const [change, setChange] = useState(false);
  const [showUnboxing, setShowUnboxing] = useState(false);

  const displayCondition = condition.replaceAll("_", " ");

  return (
    <Overlay onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          flex flex-col
          h-[90dvh] max-h-175 w-11/12 max-w-2xl
          bg-surface border-surface border
          rounded-lg
        "
      >
        <header className="flex justify-between items-center p-5 border-b border-surface">
          <div className="space-y-0.5 text-xs text-content">
            <h1 className="text-sm font-semibold text-high cursor-copy space-x-1">
              <span onClick={() => navigator.clipboard.writeText(name)}>
                {name}
              </span>
              {(code || set_region_code) && (
                <span
                  onClick={() =>
                    navigator.clipboard.writeText(code! || set_region_code!)
                  }
                >
                  ({code || set_region_code})
                </span>
              )}
            </h1>
            <p className="text-special">
              {rarity}
              {rarity_code && ` (${rarity_code})`}
              {edition && ` - ${edition}`}
            </p>
            <p>{type === "set" ? set_type : set_name}</p>
            <p className="capitalize">
              {lang} - {displayCondition}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-subtle hover:text-high transition-colors"
          >
            <Icon icon="mingcute:close-fill" className="text-2xl font-bold" />
          </button>
        </header>

        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          {change ? <StockLogs stock={stock} /> : <StockEdit stock={stock} />}

          {showUnboxing && (
            <UnboxingModal
              product={stock.product}
              stockQuantity={stock.quantity}
              stockId={stock.id}
              onClose={() => setShowUnboxing(false)}
            />
          )}

          <div className="flex items-center mt-auto pt-4 border-t border-surface">
            <p className="mr-auto text-subtle text-sm">
              Actual:{" "}
              <span className="text-high font-semibold">{quantity}</span>
            </p>
            <ModalAction
              icon="ic:round-edit"
              title="Editar"
              active={!change}
              onClick={() => setChange(false)}
            />
            <ModalAction
              icon="ic:twotone-history"
              title="Historial"
              active={change}
              onClick={() => setChange(true)}
            />
            {type === "set" && (
              <ModalAction
                icon="game-icons:cardboard-box"
                title="Unboxing"
                onClick={() => setShowUnboxing(true)}
              />
            )}
            <ModalAction
              onClick={() => navigate(`/marketplace/${id}`)}
              icon="mdi:store-search"
              title="Buscar en Marketplace"
            />
          </div>
        </div>
      </div>
    </Overlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ModalAction button
// ─────────────────────────────────────────────────────────────────────────────

interface ModalActionProps {
  icon: string;
  title: string;
  active?: boolean;
  onClick?: () => void;
}

function ModalAction({ icon, title, active, onClick }: ModalActionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        font-bold text-2xl p-1
        cursor-pointer transition-colors
        ${active ? "text-indigo-500 dark:text-fuchsia-400" : "text-subtle hover:text-high"}
      `}
      title={title}
    >
      <Icon icon={icon} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StockEditModal  (inline number-editor dialog)
// ─────────────────────────────────────────────────────────────────────────────

interface StockEditModalProps {
  title: string;
  description: string;
  currentValue: number;
  kind: "float" | "integer";
  isPending: boolean;
  isSuccess: boolean;
  onSave: (value: number) => void;
  onClose: () => void;
}

function StockEditModal({
  title,
  description,
  currentValue,
  kind,
  isPending,
  onSave,
  onClose,
}: StockEditModalProps) {
  const [value, setValue] = useState(currentValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <Overlay onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-sm mx-4
          bg-surface border border-surface
          rounded-xl p-6 space-y-5
          shadow-xl shadow-gray-300 dark:shadow-gray-950
        "
      >
        <div className="space-y-1">
          <h2 className="font-semibold text-high text-base">{title}</h2>
          <p className="text-content text-xs">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={value}
            step={kind === "float" ? "0.01" : "1"}
            min={0}
            onChange={(e) =>
              setValue(
                kind === "float"
                  ? parseFloat(e.target.value)
                  : parseInt(e.target.value, 10),
              )
            }
            className="input-base w-full"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="
                flex-1 py-2 rounded-lg text-sm font-semibold
                text-label bg-muted hover:bg-raised
                transition-colors disabled:opacity-50
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-aurora py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StockEdit
// ─────────────────────────────────────────────────────────────────────────────

type ActiveField = "price" | "discount" | "quantity" | null;

function StockEdit({ stock }: { stock: Stock }) {
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [multiplier, setMultiplier] = useState(1);

  const priceMutation = useUpdatePrice();
  const discountMutation = useUpdatePrice();
  const adjustMutation = useAdjustStock();

  const restock = useRestock();
  const sale = useSale();
  const trade = useTrade();
  const gift = useGift();
  const lost = useLost();
  const damage = useDamage();
  const returnStock = useReturnStock();

  const isMutating =
    restock.isPending ||
    sale.isPending ||
    trade.isPending ||
    gift.isPending ||
    lost.isPending ||
    damage.isPending ||
    returnStock.isPending;

  const canDecrease = stock.quantity >= multiplier;

  const modalConfig = (() => {
    switch (activeField) {
      case "price":
        return {
          title: "Actualizar precio",
          description: `El precio actual es ${stock.price.toFixed(2)} PEN`,
          currentValue: stock.price,
          kind: "float" as const,
          isPending: priceMutation.isPending,
          isSuccess: priceMutation.isSuccess,
          onSave: (value: number) =>
            priceMutation.mutate({
              stock_id: stock.id,
              price: value,
              discount_price: stock.discount_price,
            }),
        };
      case "discount":
        return {
          title: "Actualizar descuento",
          description: `El descuento actual es ${stock.discount_price.toFixed(2)} PEN`,
          currentValue: stock.discount_price,
          kind: "float" as const,
          isPending: discountMutation.isPending,
          isSuccess: discountMutation.isSuccess,
          onSave: (value: number) =>
            discountMutation.mutate({
              stock_id: stock.id,
              price: stock.price,
              discount_price: value,
            }),
        };
      case "quantity":
        return {
          title: "Ajustar stock",
          description: `El stock actual es ${stock.quantity} unidades`,
          currentValue: stock.quantity,
          kind: "integer" as const,
          isPending: adjustMutation.isPending,
          isSuccess: adjustMutation.isSuccess,
          onSave: (value: number) =>
            adjustMutation.mutate({
              stock_id: stock.id,
              new_quantity: value,
            }),
        };
      default:
        return null;
    }
  })();

  return (
    <div className="flex-1 flex flex-col divide-y divide-gray-300 dark:divide-gray-700 overflow-hidden">
      {modalConfig && (
        <StockEditModal {...modalConfig} onClose={() => setActiveField(null)} />
      )}

      <div className="grid grid-cols-2 pb-5">
        <EditField
          icon="icomoon-free:price-tag"
          label="Precio"
          value={stock.price.toFixed(2) + " PEN"}
          onClick={() => setActiveField("price")}
        />
        <EditField
          icon="mdi:discount"
          label="En Descuento"
          value={stock.discount_price.toFixed(2) + " PEN"}
          onClick={() => setActiveField("discount")}
        />
        <EditField
          icon="icon-park-solid:stock-market"
          label="Stock"
          value={stock.quantity}
          onClick={() => setActiveField("quantity")}
        />
        <StockAvailability stock={stock} />
      </div>

      <div className="flex-1 flex flex-col py-5 gap-4">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs font-bold text-subtle uppercase tracking-wider">
            Acciones rápidas
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
              disabled={multiplier <= 1}
              className="
                w-6 h-6 flex items-center justify-center rounded
                text-sm font-bold text-label
                bg-muted hover:bg-raised
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              −
            </button>
            <span className="text-xs font-semibold text-high w-5 text-center tabular-nums">
              {multiplier}
            </span>
            <button
              type="button"
              onClick={() => setMultiplier((m) => Math.min(99, m + 1))}
              className="
                w-6 h-6 flex items-center justify-center rounded
                text-sm font-bold text-label
                bg-muted hover:bg-raised
                transition-colors
              "
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Increase actions */}
          <QuickAction
            label={`+${multiplier} Restock`}
            variant="increase"
            disabled={isMutating}
            onClick={() =>
              restock.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`-${multiplier} Venta`}
            variant="decrease"
            disabled={isMutating || !canDecrease}
            onClick={() =>
              sale.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`-${multiplier} Intercambio`}
            variant="decrease"
            disabled={isMutating || !canDecrease}
            onClick={() =>
              trade.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`-${multiplier} Donación`}
            variant="decrease"
            disabled={isMutating || !canDecrease}
            onClick={() =>
              gift.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`-${multiplier} Pérdida`}
            variant="decrease"
            disabled={isMutating || !canDecrease}
            onClick={() =>
              lost.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`-${multiplier} Daño`}
            variant="decrease"
            disabled={isMutating || !canDecrease}
            onClick={() =>
              damage.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
          <QuickAction
            label={`+${multiplier} Devolución`}
            variant="increase"
            className="col-span-2"
            disabled={isMutating}
            onClick={() =>
              returnStock.mutate({ stock_id: stock.id, amount: multiplier })
            }
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuickAction button
// ─────────────────────────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  variant: "increase" | "decrease";
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

function QuickAction({
  label,
  variant,
  disabled,
  onClick,
  className = "",
}: QuickActionProps) {
  const base =
    "py-2 px-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "increase"
      ? "bg-aurora text-white hover:opacity-90"
      : "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditField
// ─────────────────────────────────────────────────────────────────────────────

interface EditFieldProps {
  icon: string;
  label: string;
  value: number | string;
  onClick: () => void;
}

const EditField = ({ icon, label, value, onClick }: EditFieldProps) => {
  return (
    <div
      className="relative overflow-hidden p-1 px-2 space-y-0.5 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-xs text-subtle font-medium">
        <Icon icon={icon} className="text-lg" />
        <span>{label}</span>
      </div>
      <p className="text-sm pl-1 text-high font-semibold">{value}</p>
      <div
        className="
          absolute flex justify-center items-center
          w-full h-full inset-0
          bg-indigo-50 dark:bg-indigo-950/60
          text-indigo-500 dark:text-fuchsia-400 text-2xl
          translate-y-full group-hover:translate-y-0
          transition duration-300
        "
      >
        <Icon icon="ic:round-edit" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StockAvailability
// ─────────────────────────────────────────────────────────────────────────────

const StockAvailability = ({ stock }: { stock: Stock }) => {
  const { is_for_sale, is_for_trade } = stock;
  const { mutate: toggleForSale, isPending: isTogglingSale } =
    useToggleForSale();
  const { mutate: toggleForTrade, isPending: isTogglingTrade } =
    useToggleForTrade();
  const isLoading = isTogglingSale || isTogglingTrade;

  return (
    <div className="p-1 px-2 space-y-0.5 relative">
      <div className="flex items-center gap-1 text-xs text-subtle font-medium">
        <Icon icon="ion:switch-sharp" className="text-lg" />
        <span>Disponibilidad</span>
      </div>
      <div className="flex items-center text-xl gap-2">
        <button
          type="button"
          onClick={() =>
            toggleForSale({ stock_id: stock.id, is_for_sale: !is_for_sale })
          }
          disabled={isLoading}
          className={`transition-colors cursor-pointer ${
            is_for_sale
              ? "text-special"
              : "text-muted hover:text-subtle"
          }`}
          title={
            is_for_sale
              ? "Vendible — click para desactivar"
              : "No vendible — click para activar"
          }
        >
          <Icon icon="game-icons:sell-card" />
        </button>
        <button
          type="button"
          onClick={() =>
            toggleForTrade({ stock_id: stock.id, is_for_trade: !is_for_trade })
          }
          disabled={isLoading}
          className={`transition-colors cursor-pointer ${
            is_for_trade
              ? "text-special"
              : "text-muted hover:text-subtle"
          }`}
          title={
            is_for_trade
              ? "Intercambiable — click para desactivar"
              : "No intercambiable — click para activar"
          }
        >
          <Icon icon="game-icons:card-exchange" />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/70 rounded">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StockLogs
// ─────────────────────────────────────────────────────────────────────────────

const LOG_LABELS: Record<string, string> = {
  add: "Alta inicial",
  restock: "Restock",
  sale: "Venta",
  trade: "Intercambio",
  return: "Devolución",
  gift: "Donación",
  lost: "Pérdida",
  damage: "Daño",
  adjustment: "Ajuste",
  rollback: "Rollback",
  price_change: "Cambio de precio",
  discount_change: "Cambio de descuento",
};

function StockLogs({ stock }: { stock: Stock }) {
  const { data: logs, isLoading } = useStockLogs(stock.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-content text-sm gap-2">
        <div className="w-4 h-4 border-2 border-surface border-t-indigo-500 rounded-full animate-spin" />
        Cargando historial...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-subtle text-sm">
        Sin historial disponible
      </div>
    );
  }

  return <LogTimeline logs={logs} stock={stock} />;
}

// ─── Log color helpers ────────────────────────────────────────────────────────

const dotColor = (type: string, pending: boolean) => {
  if (pending) return "bg-subtle";
  switch (type) {
    case "add":
    case "restock":
    case "return":
      return "bg-fuchsia-500";
    case "sale":
    case "trade":
    case "gift":
    case "lost":
    case "damage":
      return "bg-indigo-500";
    case "adjustment":
      return "bg-yellow-500";
    case "rollback":
      return "bg-orange-500";
    case "price_change":
    case "discount_change":
      return "bg-blue-500";
    default:
      return "bg-subtle";
  }
};

const deltaColor = (type: string) => {
  switch (type) {
    case "add":
    case "restock":
    case "return":
      return "text-fuchsia-600 dark:text-fuchsia-400";
    case "sale":
    case "trade":
    case "gift":
    case "lost":
    case "damage":
      return "text-indigo-600 dark:text-indigo-400";
    default:
      return "text-high";
  }
};

// ─── LogTimeline ─────────────────────────────────────────────────────────────

function LogTimeline({ logs, stock }: { logs: Log[]; stock: Stock }) {
  const rollback = useRollback();

  return (
    <div className="overflow-y-auto flex-1 scrollbar-surface">
      <ul className="relative px-2">
        <div className="absolute left-3.25 top-2 bottom-2 w-px bg-surface" />
        {logs.map((log) => (
          <LogEntry key={log.id} log={log} stock={stock} rollback={rollback} />
        ))}
      </ul>
    </div>
  );
}

// ─── LogEntry ─────────────────────────────────────────────────────────────────

function LogEntry({
  log,
  stock,
  rollback,
}: {
  log: Log;
  stock: Stock;
  rollback: ReturnType<typeof useRollback>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [note, setNote] = useState("");

  const isRollbackPending = rollback.isPending && showConfirm;

  const canRollback = [
    "add",
    "restock",
    "return",
    "sale",
    "trade",
    "gift",
    "lost",
    "damage",
    "adjustment",
    "price_change",
    "discount_change",
  ].includes(log.log_type);

  const date = new Date(log.created_at).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleRollback = () => {
    rollback.mutate(
      {
        stock_id: stock.id,
        log_id: log.id,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setShowConfirm(false);
          setNote("");
        },
      },
    );
  };

  return (
    <li className="relative pl-7 pb-4">
      <div
        className={`absolute left-1.25 top-1.5 w-4.25 h-4.25 rounded-full
          border-2 border-surface ${dotColor(log.log_type, isRollbackPending)}`}
      />

      <div className="text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-high text-xs">
            {LOG_LABELS[log.log_type] ?? log.log_type}
          </span>
          <span className="text-[10px] text-subtle shrink-0">{date}</span>
        </div>

        {log.delta !== 0 && (
          <p className="text-xs mt-0.5">
            <span className={deltaColor(log.log_type)}>
              {log.delta > 0 ? "+" : ""}
              {log.delta}
            </span>{" "}
            <span className="text-subtle">
              ({log.previous_stock} → {log.new_stock})
            </span>
          </p>
        )}

        {log.log_type === "price_change" && (
          <p className="text-xs text-content mt-0.5">
            Precio: S/. {Number(log.previous_price).toFixed(2)} →{" "}
            {log.new_price > 0
              ? `S/. ${Number(log.new_price).toFixed(2)}`
              : "Sin precio"}
          </p>
        )}

        {log.log_type === "discount_change" && (
          <p className="text-xs text-content mt-0.5">
            Descuento: S/. {Number(log.previous_discount).toFixed(2)} →{" "}
            {log.new_discount > 0
              ? `S/. ${Number(log.new_discount).toFixed(2)}`
              : "Sin descuento"}
          </p>
        )}

        {log.note && (
          <p className="text-sm text-subtle mt-0.5 italic">{log.note}</p>
        )}

        {log.parent_log_id && (
          <p className="text-[10px] text-subtle mt-0.5">
            Rollback del log #{log.parent_log_id}
          </p>
        )}

        {canRollback && !showConfirm && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="
              mt-1.5 flex items-center gap-1 px-2 py-1 text-[10px] font-medium
              text-label bg-muted hover:bg-raised rounded
              transition-colors
            "
          >
            <Icon icon="mdi:undo" className="text-xs" />
            Revertir
          </button>
        )}

        {showConfirm && (
          <div className="mt-2 p-2 bg-muted rounded border border-surface space-y-2">
            <p className="text-xs text-content">
              ¿Revertir{" "}
              <strong>{LOG_LABELS[log.log_type]?.toLowerCase()}</strong>?
              {log.delta !== 0 && (
                <>
                  {" "}
                  Stock volverá a <strong>{log.previous_stock}</strong>
                </>
              )}
              {log.log_type === "price_change" && (
                <>
                  {" "}
                  Precio volverá a S/. {Number(log.previous_price).toFixed(2)}
                </>
              )}
              {log.log_type === "discount_change" && (
                <>
                  {" "}
                  Descuento volverá a S/.{" "}
                  {Number(log.previous_discount).toFixed(2)}
                </>
              )}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              rows={2}
              className="input-base w-full resize-none text-xs"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setNote("");
                }}
                disabled={rollback.isPending}
                className="
                  flex-1 px-2 py-1 text-xs rounded
                  text-label bg-muted hover:bg-raised
                  disabled:opacity-50 transition-colors
                "
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRollback}
                disabled={rollback.isPending}
                className="
                  flex-1 px-2 py-1 text-xs rounded
                  btn-aurora flex items-center justify-center gap-1
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {rollback.isPending && (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {rollback.isPending ? "Revirtiendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UnboxingModal
// ─────────────────────────────────────────────────────────────────────────────

interface UnboxingModalProps {
  product: Product;
  stockQuantity: number;
  stockId: number;
  onClose: () => void;
}

function UnboxingModal({
  product,
  stockQuantity,
  stockId,
  onClose,
}: UnboxingModalProps) {
  const { data: cards, isLoading } = useCardsBySet({
    set_external_id: product.set_external_id,
    lang: product.lang,
  });
  const openBox = useOpenBox();

  const defaultRef = useRef<CardListRef>(null);
  const bonusRef = useRef<CardListRef>(null);
  const [multiplier, setMultiplier] = useState(1);

  const handleOpenBox = () => {
    const defaultItems = defaultRef.current?.getQuantities() ?? [];
    const bonusItems = bonusRef.current?.getQuantities() ?? [];

    openBox.mutate(
      {
        stock_id: stockId,
        quantity: multiplier,
        items: [...defaultItems, ...bonusItems],
      },
      { onSuccess: () => onClose() },
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const defaultCards = cards?.filter((c) => c.quantity_per_set >= 1) ?? [];
  const bonusCards = cards?.filter((c) => c.quantity_per_set === 0) ?? [];

  return (
    <Overlay onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          flex flex-col
          h-[85vh] w-11/12 max-w-2xl
          bg-surface border border-surface
          rounded-lg
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface shrink-0">
          <div>
            <h2 className="font-semibold text-high text-sm">Abrir set</h2>
            <p className="text-xs text-content mt-0.5">
              {product.name} · {product.lang} · {product.set_code}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-subtle hover:text-high transition-colors"
          >
            <Icon icon="mingcute:close-fill" className="text-xl font-bold" />
          </button>
        </div>

        {/* Multiplier bar */}
        <div className="px-5 py-3 border-b border-surface shrink-0 flex items-center justify-between">
          <span className="text-xs text-content">
            {defaultCards.length} cartas · {bonusCards.length} bonus
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
              disabled={multiplier <= 1}
              className="
                w-6 h-6 flex items-center justify-center rounded
                text-sm font-bold text-label
                bg-muted hover:bg-raised
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              −
            </button>
            <span className="text-xs font-semibold text-high w-5 text-center tabular-nums">
              {multiplier}
            </span>
            <button
              type="button"
              onClick={() =>
                setMultiplier((m) => Math.min(stockQuantity, m + 1))
              }
              disabled={multiplier >= stockQuantity}
              className="
                w-6 h-6 flex items-center justify-center rounded
                text-sm font-bold text-label
                bg-muted hover:bg-raised
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              +
            </button>
          </div>
        </div>

        <p className="px-5 py-1 text-xs text-content border-b border-surface shrink-0">
          Stock: {stockQuantity} uds · Mostrando: {multiplier}{" "}
          {multiplier === 1 ? "set" : "sets"}
        </p>

        {/* Card lists */}
        <div className="flex-1 overflow-y-auto scrollbar-surface px-5 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-content text-sm gap-2">
              <div className="w-4 h-4 border-2 border-surface border-t-indigo-500 rounded-full animate-spin" />
              Cargando cartas...
            </div>
          )}

          {!isLoading && (
            <>
              <details className="group" open>
                <summary className="text-xs font-semibold text-high uppercase tracking-wider mb-2 cursor-pointer list-none flex items-center gap-1.5 select-none">
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-base text-subtle transition-transform group-open:rotate-90"
                  />
                  Cartas Aleatorias ({bonusCards.length})
                </summary>
                <CardList
                  ref={bonusRef}
                  key={`bonus-${multiplier}`}
                  cards={bonusCards}
                  multiplier={multiplier}
                  setExternalId={product.set_external_id}
                  lang={product.lang}
                />
              </details>

              <details className="mb-4 group">
                <summary className="text-xs font-semibold text-high uppercase tracking-wider mb-2 cursor-pointer list-none flex items-center gap-1.5 select-none">
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-base text-subtle transition-transform group-open:rotate-90"
                  />
                  Cartas por defecto ({defaultCards.length})
                </summary>
                <CardList
                  ref={defaultRef}
                  key={`default-${multiplier}`}
                  cards={defaultCards}
                  multiplier={multiplier}
                  setExternalId={product.set_external_id}
                  lang={product.lang}
                />
              </details>
            </>
          )}
        </div>

        {/* Confirm */}
        {!isLoading && (
          <div className="border-t border-surface px-5 py-4 shrink-0">
            <button
              type="button"
              onClick={handleOpenBox}
              disabled={openBox.isPending}
              className="
                w-full btn-aurora
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {openBox.isPending && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {openBox.isPending ? "Abriendo..." : "Confirmar apertura"}
            </button>
          </div>
        )}
      </div>
    </Overlay>
  );
}
