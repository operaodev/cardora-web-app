import { useDroppable } from "@dnd-kit/core";
import { useMarketAnalysis } from "@/hooks/useMarketplace";
import { useRelatedCards } from "@/hooks/useProduct";
import type { Product } from "@/types/product";
import { DraggableRelatedCard } from "./DraggableRelatedCard";
import { useState } from "react";

interface Props {
  product: Product;
  comparedCardId: number | null;
}

export function ProductSidebar({ product, comparedCardId }: Props) {
  const { data: market } = useMarketAnalysis(product.id);
  const { data: comparedMarket } = useMarketAnalysis(comparedCardId);
  const { data: relatedCards, isLoading: isRelatedLoading } = useRelatedCards(
    product
      ? {
          id: product.id,
          external_id: product.external_id,
          set_external_id: product.set_external_id,
          tcg: product.tcg,
          lang: product.lang,
        }
      : null
  );

  const [activeLang, setActiveLang] = useState<string>("All");

  const { isOver, setNodeRef } = useDroppable({
    id: "market-prices-box",
  });

  const languages = relatedCards
    ? ["All", ...Array.from(new Set(relatedCards.different_lang.map((c) => c.lang)))]
    : ["All"];

  const filteredCards = relatedCards?.different_lang.filter(
    (c) => activeLang === "All" || c.lang === activeLang
  );

  // Find the currently compared card data if any
  const comparedCard = relatedCards?.different_lang.find(
    (c) => c.id === comparedCardId
  );

  return (
    <aside className="w-full space-y-4">
      {/* Droppable Market Box */}
      <div
        ref={setNodeRef}
        className={`bg-surface py-3 px-4 rounded-xl space-y-3 border-2 transition-colors duration-200 ${
          isOver ? "border-indigo-500 shadow-md bg-indigo-50 dark:bg-indigo-900/20" : "border-transparent"
        }`}
      >
        <div className="flex justify-around gap-2">
          {/* Main Card Market */}
          <div className="flex-1 space-y-2">
            <h4 className="text-center text-xs font-bold text-title uppercase truncate">
              {product.lang}
            </h4>
            {market ? (
              <div className="flex justify-around gap-2">
                {[
                  { label: "Low", value: market.low_price },
                  { label: "Avg", value: market.average_price },
                  { label: "High", value: market.high_price },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] text-content uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-high">
                      {value != null ? `$${value.toFixed(2)}` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-10 animate-pulse bg-raised rounded" />
            )}
            {market?.market_stock != null && (
              <div className="text-center pt-2 border-t border-surface-raised">
                <p className="text-[10px] text-content uppercase tracking-wider">
                  Total stock
                </p>
                <p className="text-xs font-semibold text-title">
                  {market.market_stock} copias
                </p>
              </div>
            )}
          </div>

          {/* Compared Card Market */}
          {comparedCardId && comparedCard && (
            <>
              <div className="w-px bg-surface-raised" />
              <div className="flex-1 space-y-2 relative">
                <h4 className="text-center text-xs font-bold text-indigo-600 dark:text-fuchsia-500 uppercase truncate">
                  {comparedCard.lang}
                </h4>
                {comparedMarket ? (
                  <div className="flex justify-around gap-2">
                    {[
                      { label: "Low", value: comparedMarket.low_price },
                      { label: "Avg", value: comparedMarket.average_price },
                      { label: "High", value: comparedMarket.high_price },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-[10px] text-content uppercase tracking-wider">
                          {label}
                        </p>
                        <p className="text-sm font-bold text-high">
                          {value != null ? `$${value.toFixed(2)}` : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-10 animate-pulse bg-raised rounded" />
                )}
                {comparedMarket?.market_stock != null && (
                  <div className="text-center pt-2 border-t border-surface-raised">
                    <p className="text-[10px] text-content uppercase tracking-wider">
                      Total stock
                    </p>
                    <p className="text-xs font-semibold text-title">
                      {comparedMarket.market_stock} copias
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {!comparedCardId && (
          <div className="text-center pt-1">
             <p className="text-xs text-subtle italic">Arrastra una carta aquí para comparar</p>
          </div>
        )}
      </div>

      {/* Related Cards */}
      {isRelatedLoading ? (
        <div className="space-y-2">
          <div className="h-6 w-1/2 rounded animate-pulse bg-raised" />
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded animate-pulse bg-surface" />
            ))}
          </div>
        </div>
      ) : relatedCards ? (
        <div className="space-y-3">
          {relatedCards.different_lang.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-title mb-2">Otros idiomas</h3>
              
              {/* Language Filters */}
              <div className="flex gap-2 flex-wrap mb-3">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeLang === lang
                        ? "bg-title text-base"
                        : "bg-surface text-content hover:bg-raised"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Draggable Cards List */}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {filteredCards?.map((card) => (
                  <DraggableRelatedCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
