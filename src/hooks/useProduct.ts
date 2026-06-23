import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Product,
  RelatedCardsResponse,
  RelatedCardsInput,
  GetCardsBySetInput,
} from "@/types/product";

const PRODUCT_KEY = "product" as const;

export const randomNames = async (limit: number) => {
  const response = await apiClient.get(`/products/random/${limit}`);
  return response.data as { names: string[] };
};

async function fetchProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

async function fetchRelatedCards(
  input: RelatedCardsInput,
): Promise<RelatedCardsResponse> {
  const { data } = await apiClient.post<RelatedCardsResponse>(
    "/products/related",
    input,
  );
  return data;
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => fetchProduct(id),
    retry: true,
  });
}

export function useRelatedCards(input: RelatedCardsInput | null) {
  return useQuery({
    queryKey: [PRODUCT_KEY, input?.id, "related"],
    queryFn: () => fetchRelatedCards(input!),
    enabled: input != null,
    retry: false,
  });
}

async function fetchCardsBySet(input: GetCardsBySetInput): Promise<Product[]> {
  const { data } = await apiClient.post<Product[]>("/products/set", input);
  return data;
}

export function useCardsBySet(input: GetCardsBySetInput | null) {
  return useQuery({
    queryKey: [PRODUCT_KEY, "set", input?.set_external_id, input?.lang],
    queryFn: () => fetchCardsBySet(input!),
    enabled: input != null,
    retry: false,
  });
}
