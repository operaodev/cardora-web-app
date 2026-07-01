import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useEffect, useState } from "react";
import type {
  Stock,
  Log,
  FilterInput,
  FilterOutput,
  StockPage,
  CreateStockInput,
  QuantityInput,
  DecreaseInput,
  AdjustmentInput,
  RollbackInput,
  OpenBoxInput,
} from "@/types/stock";

const STOCK_KEY = "stock" as const;

// ── Queries ────────────────────────────────────────────────────────────────

async function fetchMyStock(input: FilterInput): Promise<StockPage> {
  const { data } = await apiClient.post<StockPage>("/stock/me", input);
  return data;
}

async function fetchStockByUserID(
  userID: string,
  input: FilterInput,
): Promise<StockPage> {
  const { data } = await apiClient.post<StockPage>(
    `/stock/user/${userID}`,
    input,
  );
  return data;
}

async function fetchMyStockFilters(input: string): Promise<FilterOutput> {
  const { data } = await apiClient.post<FilterOutput>("/stock/me/filters", {
    input,
  });
  return data;
}

async function fetchStockByID(id: number): Promise<Stock> {
  const { data } = await apiClient.get<Stock>(`/stock/id/${id}`);
  return data;
}

async function fetchStockLogs(stockID: number): Promise<Log[]> {
  const { data } = await apiClient.get<Log[]>(`/stock/logs/${stockID}`);
  return data;
}

/** Devuelve el stock paginado y filtrado del usuario autenticado. */
export function useMyStock(input: FilterInput = {}) {
  return useQuery({
    queryKey: [STOCK_KEY, "me", input],
    queryFn: () => fetchMyStock(input),
    retry: false,
    placeholderData: (prev) => prev,
  });
}

/** Devuelve el stock paginado y filtrado de cualquier usuario por su ID. */
export function useStockByUserID(
  userID: string | null,
  input: FilterInput = {},
) {
  return useQuery({
    queryKey: [STOCK_KEY, "user", userID, input],
    queryFn: () => fetchStockByUserID(userID!, input),
    enabled: !!userID,
    retry: false,
    placeholderData: (prev) => prev,
  });
}

/**
 * Retorna los valores únicos del stock del usuario para construir filtros.
 * Reactivo al `input` de búsqueda con debounce de 300 ms.
 */
export function useMyStockFilters(input: string) {
  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  return useQuery({
    queryKey: [STOCK_KEY, "me", "filters", debouncedInput],
    queryFn: () => fetchMyStockFilters(debouncedInput),
    retry: false,
    staleTime: 30_000,
  });
}

/**
 * Stock del usuario autenticado con scroll infinito.
 * Sigue el mismo patrón que useInfiniteMarketCards:
 * - `page` en el FilterInput actúa como página inicial (jump-to-page).
 * - El pageParam controla la página real enviada al backend.
 */
export function useInfiniteMyStock(input: FilterInput | null) {
  const initialPage = input?.page ?? 1;
  // Excluye page del body — lo gestiona pageParam
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page: _page, ...filterBody } = (input ?? {}) as FilterInput;

  return useInfiniteQuery({
    queryKey: [STOCK_KEY, "me", "infinite", filterBody, initialPage],
    queryFn: ({ pageParam = initialPage }) =>
      fetchMyStock({ ...filterBody, page: pageParam as number }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.page > 1 ? firstPage.page - 1 : undefined,
    initialPageParam: initialPage,
    enabled: input != null,
    retry: false,
  });
}

export function useStockByID(stockID: number | null) {
  return useQuery({
    queryKey: [STOCK_KEY, stockID],
    queryFn: () => fetchStockByID(stockID!),
    enabled: stockID != null,
    retry: false,
  });
}

export function useStockLogs(stockID: number | null) {
  return useQuery({
    queryKey: [STOCK_KEY, stockID, "logs"],
    queryFn: () => fetchStockLogs(stockID!),
    enabled: stockID != null,
    retry: false,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

function invalidateStock(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [STOCK_KEY] });
}

export function useCreateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStockInput) => {
      const { data } = await apiClient.post<Stock>("/stock", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useRestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuantityInput) => {
      const { data } = await apiClient.post<Stock>("/stock/restock", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useReturnStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuantityInput) => {
      const { data } = await apiClient.post<Stock>("/stock/return", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DecreaseInput) => {
      console.log(input);
      const { data } = await apiClient.post<Stock>("/stock/sale", input);

      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DecreaseInput) => {
      const { data } = await apiClient.post<Stock>("/stock/trade", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DecreaseInput) => {
      const { data } = await apiClient.post<Stock>("/stock/gift", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DecreaseInput) => {
      const { data } = await apiClient.post<Stock>("/stock/lost", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useDamage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DecreaseInput) => {
      const { data } = await apiClient.post<Stock>("/stock/damage", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdjustmentInput) => {
      const { data } = await apiClient.post<Stock>("/stock/adjust", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useRollback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RollbackInput) => {
      const { data } = await apiClient.post<Stock>("/stock/rollback", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useUpdatePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      stock_id: number;
      price: number;
      discount_price?: number;
      note?: string;
    }) => {
      const { data } = await apiClient.post<Stock>(
        `/stock/${input.stock_id}/price`,
        {
          price: input.price,
          discount_price: input.discount_price ?? 0,
          note: input.note,
        },
      );
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useToggleForSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stock_id,
      is_for_sale,
    }: {
      stock_id: number;
      is_for_sale: boolean;
    }) => {
      const { data } = await apiClient.post<Stock>(
        `/stock/${stock_id}/for-sale`,
        {
          is_for_sale,
        },
      );
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useToggleForTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stock_id,
      is_for_trade,
    }: {
      stock_id: number;
      is_for_trade: boolean;
    }) => {
      const { data } = await apiClient.post<Stock>(
        `/stock/${stock_id}/for-trade`,
        {
          is_for_trade,
        },
      );
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}

export function useOpenBox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: OpenBoxInput) => {
      const { data } = await apiClient.post<Stock>("/stock/openbox", input);
      return data;
    },
    onSuccess: () => invalidateStock(qc),
  });
}
