import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import {
  useWishlist,
  useUpsertWishlist,
  useDeleteWishlistItem,
} from "@/hooks/useCustomPacks";
import type { WishlistItem } from "@/types/custom_packs";

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Wishlist() {
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading, isError } = useWishlist();

  const filtered = items.filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="flex-1 py-3">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-title">
            Lista de deseados
            {!isLoading && (
              <span className="ml-2 text-sm font-medium text-content">
                ({items.length})
              </span>
            )}
          </h1>
        </div>

        {/* Search input */}
        <div className="relative">
          <Icon
            icon="material-symbols:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-lg pointer-events-none"
          />
          <input
            id="wishlist-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="input-base w-full pl-9"
          />
        </div>

        {/* States */}
        {isLoading && <WishlistSkeleton />}

        {isError && (
          <div className="flex items-center gap-2 text-sm text-content py-6 justify-center">
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-xl text-red-400"
            />
            <span>Error al cargar la lista de deseados.</span>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-content">
            <Icon icon="mdi:star-outline" className="text-4xl text-subtle" />
            <p className="text-sm">
              {search
                ? "Sin resultados para esa búsqueda."
                : "Tu lista de deseados está vacía."}
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WishlistItemCard
// ─────────────────────────────────────────────────────────────────────────────

function WishlistItemCard({ item }: { item: WishlistItem }) {
  const { product, quantity, notifications } = item;

  const upsert = useUpsertWishlist();
  const remove = useDeleteWishlistItem();

  const isPending = upsert.isPending || remove.isPending;

  function handleDelta(delta: number) {
    upsert.mutate({ product_id: product.id, delta });
  }

  function handleDelete() {
    remove.mutate(item.id);
  }

  // Image: prefer first card image, then set_image_small, then set_image
  const image =
    product.images?.[0]?.image_url_small ??
    product.images?.[0]?.image_url ??
    product.set_image_small ??
    product.set_image ??
    null;

  return (
    <li className="flex gap-4 p-4 card-surface rounded-xl">
      {/* Thumbnail */}
      {image && (
        <Link to={`/marketplace/${product.id}`} className="relative shrink-0 w-14 aspect-475/696 self-start block hover:opacity-80 transition-opacity">
          <img
            src={image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </Link>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <Link to={`/marketplace/${product.id}`} className="space-y-0.5 block hover:opacity-80 transition-opacity">
          <p className="text-sm font-semibold text-title truncate">
            {product.name}
          </p>
          <p className="text-xs text-content truncate">{product.set_name}</p>
          {(product.code || product.rarity) && (
            <p className="text-xs text-subtle">
              {[product.code, product.rarity].filter(Boolean).join(" · ")}
            </p>
          )}
        </Link>

        {/* Bottom row: quantity controls + actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1 bg-muted rounded-lg px-1 py-0.5">
            <button
              id={`wishlist-decrement-${item.id}`}
              onClick={() => handleDelta(-1)}
              disabled={isPending}
              aria-label="Disminuir cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md icon-interactive disabled:opacity-40 hover:bg-raised transition-colors duration-150"
            >
              <Icon icon="mdi:minus" className="text-base" />
            </button>

            <span className="w-6 text-center text-sm font-semibold text-high tabular-nums">
              {quantity}
            </span>

            <button
              id={`wishlist-increment-${item.id}`}
              onClick={() => handleDelta(1)}
              disabled={isPending}
              aria-label="Aumentar cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md icon-interactive disabled:opacity-40 hover:bg-raised transition-colors duration-150"
            >
              <Icon icon="mdi:plus" className="text-base" />
            </button>
          </div>

          {/* Notification bell (UI only for now) */}
          <button
            id={`wishlist-notify-${item.id}`}
            aria-label={
              notifications
                ? "Desactivar notificaciones"
                : "Activar notificaciones"
            }
            className="flex items-center justify-center w-8 h-8 rounded-lg icon-interactive hover:bg-raised transition-colors duration-150"
          >
            <Icon
              icon={
                notifications
                  ? "mdi:notifications-active"
                  : "mdi:notifications-off"
              }
              className={`text-lg ${notifications ? "text-indigo-500 dark:text-fuchsia-400" : ""}`}
            />
          </button>

          {/* Delete */}
          <button
            id={`wishlist-delete-${item.id}`}
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Eliminar de la lista"
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-raised disabled:opacity-40 transition-colors duration-150"
          >
            <Icon icon="mdi:trash-can-outline" className="text-lg" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex gap-4 p-4 bg-surface border border-surface rounded-xl animate-pulse"
        >
          <div className="w-14 aspect-475/696 bg-raised rounded shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-raised rounded w-3/5" />
            <div className="h-3 bg-raised rounded w-2/5" />
            <div className="h-3 bg-raised rounded w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}
