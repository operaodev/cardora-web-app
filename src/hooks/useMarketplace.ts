import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  MarketAnalysis,
  OffersInput,
  Page,
  FilterInput,
  ProductResume,
  Offer,
} from "@/types/marketplace";

const MARKETPLACE_KEY = "marketplace" as const;

async function fetchMarketAnalysis(id: number): Promise<MarketAnalysis> {
  const { data } = await apiClient.get<MarketAnalysis>(
    `/marketplace/analysis/${id}`,
  );
  return data;
}

async function fetchOffers(input: OffersInput): Promise<Page<Offer>> {
  const { productId, forSale, forTrade, hasStock, sortDesc, page, limit } =
    input;
  const params = new URLSearchParams();

  if (forSale != null) params.set("for_sale", String(forSale));
  if (forTrade != null) params.set("for_trade", String(forTrade));
  if (hasStock != null) params.set("has_stock", String(hasStock));
  if (sortDesc) params.set("sort", "desc");
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const { data } = await apiClient.get<Page<Offer>>(
    `/marketplace/offers/${productId}?${params}`,
  );
  return data;
}

export function useMarketAnalysis(productId: number | null) {
  return useQuery({
    queryKey: [MARKETPLACE_KEY, productId],
    queryFn: () => fetchMarketAnalysis(productId!),
    enabled: productId != null,
    retry: false,
  });
}

export function useOffers(input: OffersInput | null) {
  return useQuery({
    queryKey: [MARKETPLACE_KEY, input?.productId, "offers", input],
    queryFn: () => fetchOffers(input!),
    enabled: input != null,
    retry: false,
  });
}

async function fetchMarketCards(
  input: FilterInput,
): Promise<Page<ProductResume>> {
  const { data } = await apiClient.post<Page<ProductResume>>(
    "/marketplace/cards",
    input,
  );
  return data;
}

export function useMarketCards(input: FilterInput | null) {
  return useQuery({
    queryKey: [MARKETPLACE_KEY, "cards", input],
    queryFn: () => fetchMarketCards(input!),
    enabled: input != null,
    retry: false,
  });
}

// Stable filter key without page so all pages share the same cache entry
type InfiniteFilterInput = Omit<FilterInput, "page">;

export function useInfiniteMarketCards(input: InfiniteFilterInput | null) {
  return useInfiniteQuery({
    queryKey: [MARKETPLACE_KEY, "cards", "infinite", input],
    queryFn: ({ pageParam = 1 }) =>
      fetchMarketCards({ ...input!, page: pageParam as number }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: input != null,
    retry: false,
  });
}
