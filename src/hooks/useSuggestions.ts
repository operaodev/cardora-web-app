import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { SuggestionDTO, SuggestionInput } from "@/types/suggestion";

const SUGGESTIONS_KEY = "suggestions" as const;

async function fetchSuggestions(
  input: SuggestionInput,
  simple: boolean,
): Promise<SuggestionDTO[]> {
  const url = simple ? "/products/suggestions/simple" : "/products/suggestions";
  const { data } = await apiClient.post<SuggestionDTO[]>(url, input);
  return data;
}

export function useSuggestions(query: SuggestionInput, simple: boolean = true) {
  return useQuery({
    queryKey: [SUGGESTIONS_KEY, query.tcg, query.lang, query.input, simple],
    queryFn: () => fetchSuggestions(query, simple),
    enabled: query.input.length > 2,
    staleTime: 30_000,
  });
}
