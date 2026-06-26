import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteMarketCards } from "@/hooks/useMarketplace";
import type { ProductResume } from "@/types/marketplace";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import PageControl from "@/components/controls/PageControl";

export default function Marketplace() {
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

  /**
   * activePage: visually highlighted in PageControl.
   * Updated by scroll listener as the user moves through the page.
   */
  const [activePage, setActivePage] = useState(1);

  /**
   * justJumpedRef: flag that prevents the top sentinel from immediately
   * auto-loading previous pages right after a jump-to-page reset.
   * Cleared once the user scrolls more than 100px down from the top.
   */
  const justJumpedRef = useRef(false);

  const filterInput = {
    input: query,
    limit: 30,
    page: startPage,
    product_Type: selectedProductType || undefined,
    ...(selectedLang ? { langs: [selectedLang] } : {}),
    ...(selectedTcg ? { tcgs: [selectedTcg] } : {}),
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteMarketCards(filterInput);

  // Range of pages currently in the React Query cache
  const loadedFrom = data?.pages[0]?.page ?? 0;
  const loadedUpTo = data?.pages[data.pages.length - 1]?.page ?? 0;
  const totalPages = data?.pages[0]?.total_pages ?? 0;
  // Item limit per page (for skeleton count when fetching previous)
  const pageLimit = data?.pages[0]?.limit ?? 30;

  // ── Bottom sentinel — loads next pages ───────────────────────────────────
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const onIntersectBottom = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;
    const isMobile = window.innerWidth < 640;
    const observer = new IntersectionObserver(onIntersectBottom, {
      root: null,
      rootMargin: isMobile ? "400px" : "800px",
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersectBottom]);

  // ── Top sentinel — loads previous pages when scrolling up after a jump ────
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const onIntersectTop = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasPreviousPage &&
        !isFetchingPreviousPage &&
        !justJumpedRef.current // guard: skip until user scrolls down first
      ) {
        fetchPreviousPage();
      }
    },
    [fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage],
  );

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const isMobile = window.innerWidth < 640;
    // Smaller rootMargin than the bottom: only auto-load when actually near the top
    const observer = new IntersectionObserver(onIntersectTop, {
      root: null,
      rootMargin: isMobile ? "200px" : "400px",
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersectTop]);

  // ── Scroll: active page tracking + clear justJumped flag ─────────────────
  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;

      // Once user scrolls down after a jump, re-enable the top sentinel
      if (y > 100 && justJumpedRef.current) {
        justJumpedRef.current = false;
      }

      // Find which page anchor is highest but still above 40% of viewport
      const anchors =
        document.querySelectorAll<HTMLElement>("[data-page-anchor]");
      if (!anchors.length) return;

      const threshold = window.innerHeight * 0.4;
      let current = loadedFrom || 1;

      anchors.forEach((anchor) => {
        const top = anchor.getBoundingClientRect().top;
        if (top <= threshold) {
          current = Number(anchor.getAttribute("data-page-anchor")) || current;
        }
      });

      setActivePage(current);
    };

    window.addEventListener("scroll", handle, { passive: true });
    handle(); // run once immediately on mount / when loadedFrom changes
    return () => window.removeEventListener("scroll", handle);
  }, [loadedFrom, loadedUpTo]);

  // ── Scroll to anchor helper ───────────────────────────────────────────────
  const scrollToAnchor = (page: number) => {
    setTimeout(() => {
      const anchor = document.querySelector<HTMLElement>(
        `[data-page-anchor="${page}"]`,
      );
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // ── Page navigation ───────────────────────────────────────────────────────
  /**
   * Four cases:
   *  1. page is inside [loadedFrom, loadedUpTo]  → scroll to its anchor
   *  2. page === loadedUpTo + 1                  → fetchNextPage + scroll
   *  3. page === loadedFrom - 1                  → fetchPreviousPage + scroll
   *  4. gap ≥ 2 pages outside loaded range       → restart query from page
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setActivePage(page);

      const inCache =
        loadedFrom > 0 && page >= loadedFrom && page <= loadedUpTo;

      if (inCache) {
        // Already in the DOM → just scroll
        scrollToAnchor(page);
      } else if (page === loadedUpTo + 1) {
        // Adjacent next → fetch and scroll when ready
        fetchNextPage().then(() => scrollToAnchor(page));
      } else if (loadedFrom > 1 && page === loadedFrom - 1) {
        // Adjacent previous → fetch and scroll when ready
        fetchPreviousPage().then(() => scrollToAnchor(page));
      } else {
        // Gap of 2+ pages → restart the query from this page
        justJumpedRef.current = true;
        setStartPage(page);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    },
    [loadedFrom, loadedUpTo, fetchNextPage, fetchPreviousPage],
  );

  // ── Next-page skeleton count ──────────────────────────────────────────────
  const lastPageData = data?.pages[data?.pages.length - 1];
  let nextPageItemCount = 6;
  if (lastPageData) {
    const nextPage = lastPageData.page + 1;
    if (nextPage < lastPageData.total_pages) {
      nextPageItemCount = lastPageData.limit;
    } else if (nextPage === lastPageData.total_pages) {
      nextPageItemCount =
        lastPageData.total - lastPageData.page * lastPageData.limit;
    } else {
      nextPageItemCount = 0;
    }
  }

  return (
    <main className="surface min-h-screen py-5">
      <div className="mx-auto w-11/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Top sentinel (above all content) ── */}
        <div
          ref={topSentinelRef}
          className="col-span-full h-0"
          aria-hidden="true"
        />

        {/* Skeletons for previous page being fetched (prepended above content) */}
        {isFetchingPreviousPage &&
          Array.from({ length: pageLimit }).map((_, i) => (
            <SkeletonCard key={`skeleton-prev-${i}`} />
          ))}

        {/* ── All loaded pages ── */}
        {data?.pages.map((page) =>
          page.items.map((item, idx) => (
            <>
              {/* Anchor at the first card of each page */}
              {idx === 0 && (
                <div
                  key={`anchor-${page.page}`}
                  data-page-anchor={page.page}
                  className="col-span-full h-0"
                  aria-hidden="true"
                />
              )}
              <ResumenCard key={item.id} resumen={item} />
            </>
          )),
        )}

        {/* Skeletons for initial load */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={`skeleton-init-${i}`} />
          ))}

        {/* Skeletons for next page (exact count) */}
        {isFetchingNextPage &&
          Array.from({ length: nextPageItemCount }).map((_, i) => (
            <SkeletonCard key={`skeleton-next-${i}`} />
          ))}
      </div>

      {/* ── Bottom sentinel ── */}
      <div ref={bottomSentinelRef} className="h-1" aria-hidden="true" />

      {/* End-of-list message */}
      {!hasNextPage && !isLoading && loadedUpTo > 0 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mx-auto flex justify-center items-center gap-2 text-second text-sm py-5"
        >
          <Icon icon="mingcute:up-fill" className="text-xl" />
          <p className="text-center">Regresar al principio</p>
        </button>
      )}

      {/* Page control bar */}
      {totalPages > 1 && (
        <PageControl
          currentPage={activePage}
          totalPages={totalPages}
          loadedFrom={loadedFrom}
          loadedUpTo={loadedUpTo}
          onPageChange={handlePageChange}
          className="fixed bottom-0 left-0 w-full h-14 z-50 px-2"
        />
      )}
    </main>
  );
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex h-60 p-5 card-surface rounded-lg gap-5 animate-pulse">
      <div className="bg-prominent rounded aspect-475/696 h-full" />
      <div className="flex-1 flex flex-col gap-3 py-2">
        <div className="h-3 bg-prominent rounded w-3/4" />
        <div className="h-3 bg-prominent rounded w-1/2" />
        <div className="h-3 bg-prominent rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Resumen Card ───────────────────────────────────────────────────────────────
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
