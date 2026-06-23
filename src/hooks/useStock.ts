import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Stock,
  Log,
  CreateStockInput,
  QuantityInput,
  DecreaseInput,
  AdjustmentInput,
  RollbackInput,
  OpenBoxInput,
} from "@/types/stock";

const STOCK_KEY = "stock" as const;

// ── Queries ────────────────────────────────────────────────────────────────

async function fetchMyStock(): Promise<Stock[]> {
  const { data } = await apiClient.get<Stock[]>("/stock/me");
  console.log(data);
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

export function useMyStock() {
  return useQuery({
    queryKey: [STOCK_KEY, "me"],
    queryFn: fetchMyStock,
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
