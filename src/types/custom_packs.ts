import type { Product } from "@/types/product";

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  notifications: boolean;
  product: Product;
  created_at: string;
  updated_at: string;
}

export interface UpsertWishlistInput {
  product_id: number;
  /** delta > 0 incrementa, delta < 0 reduce. Si la cantidad resultante <= 0 se elimina. */
  delta: number;
}

export interface WishlistUpsertResponse {
  /** Mensaje informativo cuando el item se elimina (cantidad <= 0). */
  message?: string;
}

export interface WishlistCheckResponse {
  /** true si la carta está en la wishlist del usuario. */
  in_wishlist: boolean;
  /** ID de la entrada en la wishlist (0 si no existe). */
  wishlist_id: number;
}
