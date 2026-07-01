import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  WishlistItem,
  UpsertWishlistInput,
  WishlistCheckResponse,
  Bundle,
  CreateBundleInput,
  UpdateBundleInput,
} from "@/types/custom_packs";

const WISHLIST_KEY = "wishlist" as const;
const BUNDLES_KEY = "bundles" as const;

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

async function fetchBundles(): Promise<Bundle[]> {
  const { data } = await apiClient.get<Bundle[]>("/bundles");
  return data;
}

export function useBundles() {
  return useQuery({
    queryKey: [BUNDLES_KEY],
    queryFn: fetchBundles,
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

async function deleteWishlistItem(wishlistId: number): Promise<void> {
  await apiClient.delete(`/wishlist/${wishlistId}`);
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

// ── Bundles Mutations ──────────────────────────────────────────────────────

async function createBundle(input: CreateBundleInput): Promise<Bundle> {
  const { data } = await apiClient.post<Bundle>("/bundles", input);
  return data;
}

async function updateBundle({ bundleId, items }: UpdateBundleInput): Promise<Bundle> {
  const { data } = await apiClient.put<Bundle>(`/bundles/${bundleId}`, { items });
  return data;
}

async function deleteBundle(bundleId: number): Promise<void> {
  await apiClient.delete(`/bundles/${bundleId}`);
}

export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUNDLES_KEY] });
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUNDLES_KEY] });
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUNDLES_KEY] });
    },
  });
}

// ── Check ──────────────────────────────────────────────────────────────────

async function fetchIsInWishlist(
  productId: number,
): Promise<WishlistCheckResponse> {
  const { data } = await apiClient.get<WishlistCheckResponse>(
    `/wishlist/check/${productId}`,
  );
  return data;
}

/**
 * Verifica si una carta está en la wishlist del usuario autenticado.
 *
 * @param productId - ID del producto a verificar.
 * @param enabled   - Activa/desactiva la consulta (por defecto true).
 */
export function useIsInWishlist(productId: number, enabled = true) {
  return useQuery({
    queryKey: [WISHLIST_KEY, "check", productId],
    queryFn: () => fetchIsInWishlist(productId),
    enabled: !!productId && enabled,
    retry: false,
  });
}
