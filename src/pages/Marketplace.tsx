import { useState } from "react";
import { useInfiniteMarketCards } from "@/hooks/useMarketplace";
import type { ProductResume } from "@/types/marketplace";
import { Link, useSearchParams } from "react-router-dom";
import PageContainer from "@/components/containers/PageContainer";
// import ModalControl from "@/components/controls/ModalControl";
// import { OverlayTransition } from "@/components/modal/Overlay";

export default function Marketplace() {
  // const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const selectedLang = searchParams.get("lang") || "";
  const selectedTcg = searchParams.get("game") || "";
  const selectedProductType = searchParams.get("product_Type") || "";

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
  };

  const infiniteQuery = useInfiniteMarketCards(filterInput);

  return (
    <main className="flex-1 py-3">
      {/*<OverlayTransition
        open={showFilters}
        onClose={() => setShowFilters(false)}
        side="left"
      >
        <div></div>
      </OverlayTransition>
      <ModalControl onClick={() => setShowFilters(true)} icon="mdi:filter" />*/}
      <PageContainer<ProductResume>
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
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI-only sub-components (no data logic)
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex h-60 p-5 card-surface border rounded-lg gap-5 animate-pulse">
      <div className="bg-raised rounded aspect-475/696 h-full" />
      <div className="flex-1 flex flex-col gap-3 py-2">
        <div className="h-3 bg-raised rounded w-3/4" />
        <div className="h-3 bg-raised rounded w-1/2" />
        <div className="h-3 bg-raised rounded w-2/3" />
      </div>
    </div>
  );
}

const ResumenCard = ({ resumen }: { resumen: ProductResume }) => {
  const {
    id,
    image,
    name,
    code,
    set_name,
    rarity,
    global_stock,
    average_price,
  } = resumen;

  return (
    <Link
      to={`/marketplace/${id}`}
      className="flex h-60 p-5 card-surface rounded-lg gap-5"
    >
      <div className="relative aspect-475/696">
        <img
          className="absolute inset-0 w-full h-full object-contain"
          src={image}
          alt={name}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="space-y-1 font-medium">
          <h2 className="text-sm text-title font-semibold">{name}</h2>
          <p className="text-xs text-content">{set_name}</p>
          <p className="text-xs text-content">
            {code && `${code}`}
            {rarity && ` - ${rarity}`}
          </p>
        </div>
        {global_stock > 0 ? (
          <div className="text-high">
            <p className="text-sm font-medium">{global_stock} listado desde</p>
            <h1 className="font-bold text-xl">{average_price} PEN</h1>
          </div>
        ) : (
          <div
            className="
              w-32 py-2
              bg-tag text-tag
              text-xs text-center
              rounded-2xl font-bold
            "
          >
            Sin existencias
          </div>
        )}
      </div>
    </Link>
  );
};
