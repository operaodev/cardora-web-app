import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@iconify-icon/react";
import PageControl from "@/components/controls/PageControl";
import type { Page } from "@/types/marketplace";
import { useScrollHide } from "@/components/hooks/useScrollHide";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a number with one decimal place + 'k' suffix for values ≥ 1000.
 * Always shows one decimal to keep width predictable (e.g. 300.0k, 10.3k).
 * Sub-1000 values are shown as-is.
 */
function formatK(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InfiniteQueryData<T> {
  pages: Page<T>[];
}

export interface PageContainerProps<T> {
  /** Output of an infinite query (data, loading states, fetch helpers). */
  data: InfiniteQueryData<T> | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  fetchPreviousPage: () => Promise<unknown>;

  /**
   * Called when the user clicks a page that requires a cache reset
   * (i.e. a jump of ≥2 pages outside the loaded range).
   * The parent should update its `startPage` so the query re-initialises.
   */
  onJumpToPage: (page: number) => void;

  /** Render a single loaded item. */
  renderItem: (item: T, key: React.Key) => ReactNode;

  /** Render a skeleton placeholder card. */
  renderSkeleton: (key: React.Key) => ReactNode;

  /** Extra class names for the outer grid wrapper. */
  gridClassName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PageContainer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PageContainer — reusable container for infinite-scroll + numbered-pagination.
 *
 * Responsibilities:
 *  - Top / bottom IntersectionObserver sentinels for auto-loading pages.
 *  - Scroll listener that tracks which page anchor is currently in view.
 *  - Back-to-first-loaded-page button when the list is exhausted.
 *  - PageControl bar rendered at the bottom.
 *
 * Sentinels live **outside** the CSS grid so they never contribute to gap spacing.
 * Page anchors use -my-2 to cancel the row-gap at page boundaries, keeping
 * visual spacing consistent across cards regardless of page breaks.
 *
 * UI / Data separation: this component handles all scroll/pagination mechanics.
 * The parent only supplies the query result and render functions.
 */
export default function PageContainer<T extends object>({
  data,
  isLoading,
  isFetchingNextPage,
  isFetchingPreviousPage,
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
  onJumpToPage,
  renderItem,
  renderSkeleton,
}: PageContainerProps<T>) {
  // ── Derived page metadata ────────────────────────────────────────────────
  const loadedFrom = data?.pages[0]?.page ?? 0;
  const loadedUpTo = data?.pages[data.pages.length - 1]?.page ?? 0;
  const totalPages = data?.pages[0]?.total_pages ?? 0;
  const pageLimit = data?.pages[0]?.limit ?? 30;
  const totalItems = data?.pages[0]?.total ?? 0;

  // ── Active page (scroll-tracked) + smooth item counter ─────────────────────
  const [activePage, setActivePage] = useState(loadedFrom || 1);
  /**
   * currentItem: interpolated card index within the currently-visible page.
   * Updated on every scroll event so the counter pill counts up continuously
   * (e.g. 30 → 31 → … → 60) rather than jumping at page boundaries.
   */
  const [currentItem, setCurrentItem] = useState(0);

  // ── Counter pill scroll-hide (slides out to the right) ───────────────────
  const { hidden: counterHidden } = useScrollHide();

  /**
   * justJumpedRef: prevents the top sentinel from auto-loading previous pages
   * immediately after a jump-to-page reset. Cleared once user scrolls >100px.
   */
  const justJumpedRef = useRef(false);

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
        !justJumpedRef.current
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
    const observer = new IntersectionObserver(onIntersectTop, {
      root: null,
      rootMargin: isMobile ? "200px" : "400px",
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersectTop]);

  // ── Scroll: active page tracking + item interpolation + justJumped flag ──────
  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;

      if (y > 100 && justJumpedRef.current) {
        justJumpedRef.current = false;
      }

      const anchorNodes =
        document.querySelectorAll<HTMLElement>("[data-page-anchor]");
      if (!anchorNodes.length) return;

      const anchorList = Array.from(anchorNodes);
      const threshold = window.innerHeight * 0.4;

      let current = loadedFrom || 1;
      let currentAnchorIdx = 0;

      anchorList.forEach((anchor, idx) => {
        const top = anchor.getBoundingClientRect().top;
        if (top <= threshold) {
          current =
            Number(anchor.getAttribute("data-page-anchor")) || current;
          currentAnchorIdx = idx;
        }
      });

      setActivePage(current);

      // ── Interpolate item position within the current page ────────────────
      // currentAnchorDocY: absolute Y of the current page's anchor in the doc
      const currentAnchor = anchorList[currentAnchorIdx];
      const nextAnchor = anchorList[currentAnchorIdx + 1];

      const currentAnchorDocY =
        currentAnchor.getBoundingClientRect().top + y;
      const nextAnchorDocY = nextAnchor
        ? nextAnchor.getBoundingClientRect().top + y
        : document.body.scrollHeight;

      // How far the user has scrolled past the start of this page
      // (adjusted for the same threshold used to switch pages)
      const scrolledIntoPage = y - (currentAnchorDocY - threshold);
      const pageScrollRange = nextAnchorDocY - currentAnchorDocY;

      const fraction =
        pageScrollRange > 0
          ? Math.min(Math.max(scrolledIntoPage / pageScrollRange, 0), 1)
          : 0;

      const baseItem = (current - 1) * pageLimit;
      const estimated = Math.min(
        baseItem + Math.round(fraction * pageLimit),
        totalItems,
      );

      setCurrentItem(estimated);
    };

    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, [loadedFrom, loadedUpTo, pageLimit, totalItems]);

  // ── Scroll to anchor helper ───────────────────────────────────────────────
  const scrollToAnchor = useCallback((page: number) => {
    setTimeout(() => {
      const anchor = document.querySelector<HTMLElement>(
        `[data-page-anchor="${page}"]`,
      );
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  // ── Page navigation ───────────────────────────────────────────────────────
  const handlePageChange = useCallback(
    (page: number) => {
      setActivePage(page);

      const inCache =
        loadedFrom > 0 && page >= loadedFrom && page <= loadedUpTo;

      if (inCache) {
        scrollToAnchor(page);
      } else if (page === loadedUpTo + 1) {
        fetchNextPage().then(() => scrollToAnchor(page));
      } else if (loadedFrom > 1 && page === loadedFrom - 1) {
        fetchPreviousPage().then(() => scrollToAnchor(page));
      } else {
        // Gap of ≥2 pages → ask parent to restart query from this page
        justJumpedRef.current = true;
        onJumpToPage(page);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    },
    [
      loadedFrom,
      loadedUpTo,
      fetchNextPage,
      fetchPreviousPage,
      onJumpToPage,
      scrollToAnchor,
    ],
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

  // ── Back to top of first loaded page ─────────────────────────────────────
  /**
   * Si está en la página 1, hace scroll al inicio.
   * Si está en otra página, hace un fetch a la página 1 y un salto instantáneo.
   */
  const handleBackToTop = useCallback(() => {
    if (loadedFrom <= 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      justJumpedRef.current = true;
      onJumpToPage(1);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [loadedFrom, onJumpToPage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
        Top sentinel lives OUTSIDE the grid.
        Placing it inside a gap-N grid would make it consume row-gap space
        and create a visible extra gap between pages.
      */}
      {/* ── Counter pill — slides to the right when user scrolls down ── */}
      {totalItems > 0 && (
        <div
          className={`
            fixed right-0 z-40
            flex flex-col items-center justify-center
            w-10 h-40 gap-3
            bg-surface border border-r-0 border-surface shadow-md shadow-surface
            rounded-tl-full rounded-bl-full bevel-full
            transition-transform duration-300
            ${counterHidden ? "translate-x-full" : "translate-x-0"}
          `}
        >
          {/* Current approximate card position based on active page */}
          <span className="text-aurora text-sm font-bold leading-none">
            {formatK(Math.max(currentItem, 1))}
          </span>
          <span className="text-content text-xs font-semibold">
            {formatK(totalItems)}
          </span>
        </div>
      )}

      <div
        ref={topSentinelRef}
        className="h-0 overflow-hidden"
        aria-hidden="true"
      />

      <div className={`mx-auto w-full px-5 grid gap-4`} style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(350px, 1fr))`,
      }}>
        {/* Skeletons for previous page being fetched (prepended above content) */}
        {isFetchingPreviousPage &&
          Array.from({ length: pageLimit }).map((_, i) =>
            renderSkeleton(`skeleton-prev-${i}`),     
          )}

        {/* ── All loaded pages ── */}
        {data?.pages.map((page) =>
          page.items.map((item, idx) => (
            <>
              {/*
                Page-start anchor at the first card of each page.
                -my-2 cancels the row-gap contribution:
                  gap-4 = 1rem → each side = 0.5rem = Tailwind's -my-2
                This makes the spacing between page boundaries identical
                to the spacing between regular cards.
              */}
              {idx === 0 && (
                <div
                  key={`anchor-${page.page}`}
                  data-page-anchor={page.page}
                  className="col-span-full h-0 -my-2"
                  aria-hidden="true"
                />
              )}
              {renderItem(item, idx)}
            </>
          )),
        )}

        {/* Skeletons for initial load */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) =>
            renderSkeleton(`skeleton-init-${i}`),
          )}

        {/* Skeletons for next page (exact count) */}
        {isFetchingNextPage &&
          Array.from({ length: nextPageItemCount }).map((_, i) =>
            renderSkeleton(`skeleton-next-${i}`),
          )}
      </div>

      {/* Bottom sentinel — outside the grid so it doesn't affect gap spacing */}
      <div ref={bottomSentinelRef} className="h-1" aria-hidden="true" />

      {/* End-of-list: back to first currently-loaded page */}
      {!hasNextPage && !isLoading && loadedUpTo > 0 && (
        <button
          onClick={handleBackToTop}
          className="mx-auto flex justify-center items-center gap-2 icon-interactive text-base py-5 cursor-pointer"
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
        />
      )}
    </>
  );
}
