import { useRef } from "react";
import {
  useUpsertWishlist,
  useDeleteWishlistItem,
  useIsInWishlist,
} from "@/hooks/useCustomPacks";
import type { Product } from "@/types/product";
import { Icon } from "@iconify-icon/react";
import { useAuth } from "@/hooks/useAuth";

interface ProductFieldProps {
  field: string;
  value: string | undefined;
}

export const ProductField = ({ field, value }: ProductFieldProps) => {
  if (!value) return null;

  return (
    <div className="space-x-2 text-sm text-nowrap">
      <span className="text-content font-medium">{field}:</span>
      <span className="text-high font-semibold">{value}</span>
    </div>
  );
};

export const ProductInfo = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="bg-surface rounded-lg p-3 space-y-1 font-medium">
      <p className="text-content text-xs uppercase tracking-wider">{label}</p>
      <p className="text-high text-sm truncate capitalize">{value}</p>
    </div>
  );
};

export const ProductWishlistButton = ({ productId }: { productId: number }) => {
  const { isAuthenticated } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(productId, isAuthenticated);
  const upsertWishlist = useUpsertWishlist();
  const deleteWishlistItem = useDeleteWishlistItem();

  const isPending = upsertWishlist.isPending || deleteWishlistItem.isPending;

  const toggleWishlist = () => {
    if (isPending) return;
    if (isInWishlist?.in_wishlist) {
      deleteWishlistItem.mutate(isInWishlist.wishlist_id);
    } else {
      upsertWishlist.mutate({ product_id: productId, delta: 1 });
    }
  };

  if (!isAuthenticated) return null;

  const isWishlisted = isInWishlist && isInWishlist.in_wishlist;

  return (
    <button
      onClick={toggleWishlist}
      disabled={isPending}
      className={[
        "transition-colors text-2xl duration-200",
        isPending ? "animate-pulse cursor-not-allowed" : "cursor-pointer",
        isWishlisted
          ? "text-special hover:text-subtle"
          : "text-subtle hover:text-special",
      ].join(" ")}
      title={isWishlisted ? "Quitar de la wishlist" : "Agregar a la wishlist"}
    >
      <Icon icon="clarity-favorite-solid" />
    </button>
  );
};

export const ProductImage = ({ product }: { product: Product }) => {
  const { name, type, print_url_large, set_image_large } = product;
  const isCard = type === "card";

  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card || !isCard) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    if (innerRef.current) {
      innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleLeave = () => {
    if (innerRef.current) {
      innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="bg-base relative w-full cursor-pointer overflow-hidden rounded-lg"
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        ref={innerRef}
        className="relative w-full transition-transform duration-200 ease-out will-change-transform px-4 py-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={isCard ? print_url_large : set_image_large}
          alt={name}
          className="block w-full aspect-2.5/3.5 object-contain"
        />
      </div>
    </div>
  );
};
