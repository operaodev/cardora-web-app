import { useCallback, useEffect, useRef } from "react";
import { useInfiniteMarketCards } from "@/hooks/useMarketplace";
import type { ProductResume } from "@/types/marketplace";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";

export default function Marketplace() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const selectedLang = searchParams.get("lang") || "";
  const selectedTcg = searchParams.get("game") || "";
  const selectedProductType = searchParams.get("product_Type") || "";

  const filterInput = {
    input: query,
    limit: 30,
    product_Type: selectedProductType || undefined,
    ...(selectedLang ? { langs: [selectedLang] } : {}),
    ...(selectedTcg ? { tcgs: [selectedTcg] } : {}),
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteMarketCards(filterInput);

  // Flatten all pages into a single array
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  // Sentinel ref – when it enters the viewport we load the next page
  const sentinelRef = useRef<HTMLDivElement>(null);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const isMobile = window.innerWidth < 640;
    const observer = new IntersectionObserver(onIntersect, {
      root: null, // viewport
      rootMargin: isMobile ? "400px" : "800px", // start loading earlier on larger screens
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersect]);

  // Calculate how many items are expected in the next page to render exact number of skeletons
  const lastPage = data?.pages[data?.pages.length - 1];
  let nextPageItemCount = 6; // default fallback for initial or unknown state
  if (lastPage) {
    const nextPage = lastPage.page + 1;
    if (nextPage < lastPage.total_pages) {
      nextPageItemCount = lastPage.limit;
    } else if (nextPage === lastPage.total_pages) {
      nextPageItemCount = lastPage.total - lastPage.page * lastPage.limit;
    } else {
      nextPageItemCount = 0;
    }
  }

  return (
    <main className="surface min-h-screen pt-7 pb-17">
      <div className="mx-auto w-11/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <ResumenCard key={item.id} resumen={item} />
        ))}
        <div className="fixed bottom-0 flex w-full h-15 z-50">
          <button>
            <Icon icon="mingcute:left-fill" className="text-2xl" />
          </button>
        </div>

        {/* Skeleton cards while the initial load is happening */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex h-60 p-5 card-surface rounded-lg gap-5 animate-pulse"
            >
              <div className="bg-prominent rounded aspect-475/696 h-full" />
              <div className="flex-1 flex flex-col gap-3 py-2">
                <div className="h-3 bg-prominent rounded w-3/4" />
                <div className="h-3 bg-prominent rounded w-1/2" />
                <div className="h-3 bg-prominent rounded w-2/3" />
              </div>
            </div>
          ))}

        {/* Skeletons representing the exact number of incoming cards for the next page */}
        {isFetchingNextPage &&
          Array.from({ length: nextPageItemCount }).map((_, i) => (
            <div
              key={`next-skeleton-${i}`}
              className="flex h-60 p-5 card-surface rounded-lg gap-5 animate-pulse"
            >
              <div className="bg-prominent rounded aspect-475/696 h-full" />
              <div className="flex-1 flex flex-col gap-3 py-2">
                <div className="h-3 bg-prominent rounded w-3/4" />
                <div className="h-3 bg-prominent rounded w-1/2" />
                <div className="h-3 bg-prominent rounded w-2/3" />
              </div>
            </div>
          ))}
      </div>

      {/* Sentinel: the observer watches this element */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />

      {/* End-of-list message */}
      {!hasNextPage && !isLoading && items.length > 0 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mx-auto flex justify-center items-center gap-2 text-second text-sm py-5"
        >
          <Icon icon="mingcute:up-fill" className="text-xl" />
          <p className="text-center ">Regresar al principio</p>
        </button>
      )}
    </main>
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
      to={`products/${id}`}
      className="flex h-60 p-5 card-surface rounded-lg gap-5"
    >
      <div className="relative aspect-475/696">
        <img
          className="absolute inset-0 w-full h-full object-contain"
          src={image}
          alt={name}
        />
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-heading">{name}</h2>
          <p className="text-xs text-second">{set_name}</p>
          <p className="text-xs text-second">
            {code && `${code}`}
            {rarity && ` - ${rarity}`}
          </p>
        </div>
        {global_stock > 0 ? (
          <div className="space-y-0.5">
            <p className="text-label text-sm font-medium">
              {global_stock} listado desde
            </p>
            <h1 className="text-heading font-bold text-lg">
              {average_price} PEN
            </h1>
          </div>
        ) : (
          <div className="py-2 bg-prominent text-xs text-center rounded-2xl text-label font-medium">
            Sin stock
          </div>
        )}
      </div>
    </Link>
  );
};
