import { useState } from "react";
import { useInfiniteMarketCards } from "@/hooks/useMarketplace";
import type { ProductResume } from "@/types/marketplace";
import { useSearchParams } from "react-router-dom";
import PageContainer from "@/components/containers/PageContainer";
import MarketplaceFilterBar from "@/components/marketplace/MarketplaceFilterBar";
import { ResumenCard, SkeletonCard } from "@/components/marketplace/ResumenCard";

export default function Marketplace() {
  // const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const selectedLang = searchParams.get("lang") || "";
  const selectedTcg = searchParams.get("game") || "";
  const selectedProductType = searchParams.get("product_type") || "";
  const selectedCondition = searchParams.get("condition") || "";
  const selectedCardType = searchParams.get("card_type") || "";
  const selectedRarity = searchParams.get("rarity") || "";
  const selectedAvailability = searchParams.get("availability") || "";
  const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
  const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;

  /**
   * startPage: the page the infinite query starts from.
   * Only changes when the user jumps ≥2 unloaded pages in any direction.
   */
  const [startPage, setStartPage] = useState(1);

  const filterInput = {
    input: query,
    limit: 30,
    page: startPage,
    product_Type: selectedProductType || undefined,
    ...(selectedLang ? { langs: [selectedLang] } : {}),
    ...(selectedTcg ? { tcgs: [selectedTcg] } : {}),
    ...(selectedCondition ? { conditions: [selectedCondition] } : {}),
    ...(selectedCardType ? { card_types: [selectedCardType] } : {}),
    ...(selectedRarity ? { rarities: [selectedRarity] } : {}),
    ...(selectedAvailability ? { availability: selectedAvailability } : {}),
    ...(minPrice !== undefined ? { min_price: minPrice } : {}),
    ...(maxPrice !== undefined ? { max_price: maxPrice } : {}),
  };

  const infiniteQuery = useInfiniteMarketCards(filterInput);

  return (
    <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <MarketplaceFilterBar />
      <div className="flex-1 overflow-y-auto py-3">
      <PageContainer<ProductResume>
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data={infiniteQuery.data}
        isLoading={infiniteQuery.isLoading}
        isFetchingNextPage={infiniteQuery.isFetchingNextPage}
        isFetchingPreviousPage={infiniteQuery.isFetchingPreviousPage}
        hasNextPage={infiniteQuery.hasNextPage}
        hasPreviousPage={infiniteQuery.hasPreviousPage}
        fetchNextPage={infiniteQuery.fetchNextPage}
        fetchPreviousPage={infiniteQuery.fetchPreviousPage}
        onJumpToPage={setStartPage}
        renderItem={(item) => <ResumenCard key={item.id} resumen={item} />}
        renderSkeleton={(key) => <SkeletonCard key={key} />}
      />
      </div>
    </main>
  );
}
