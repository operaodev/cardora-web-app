import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { WishlistItem, UpsertWishlistInput } from "@/types/custom_packs";

const WISHLIST_KEY = "wishlist" as const;

// ── Queries ────────────────────────────────────────────────────────────────

async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await apiClient.get<WishlistItem[]>("/wishlist");
  return data;
}

export function useWishlist() {
  return useQuery({
    queryKey: [WISHLIST_KEY],
    queryFn: fetchWishlist,
    retry: false,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

async function upsertWishlistItem(
  input: UpsertWishlistInput,
): Promise<WishlistItem | null> {
  const { data } = await apiClient.post<WishlistItem | { message: string }>(
    "/wishlist",
    input,
  );

  // Si el backend devuelve solo un mensaje (item eliminado por cantidad <= 0),
  // retornamos null para indicarlo.
  if ("message" in data && !("id" in data)) {
    return null;
  }

  return data as WishlistItem;
}

async function deleteWishlistItem(productId: number): Promise<void> {
  await apiClient.delete(`/wishlist/${productId}`);
}

export function useUpsertWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] });
    },
  });
}
