import { useMarketAnalysis, useOffers } from "@/hooks/useMarketplace";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";

// export const ProductAnalysis = ({ product }: { product: Product }) => {
//   const { id } = product;
//   const { data: market } = useMarketAnalysis(id);
//   const { data: relatedCards, isLoading: isRelatedLoading } = useRelatedCards(
//     product
//       ? {
//           id: product.id,
//           external_id: product.external_id,
//           set_external_id: product.set_external_id,
//           tcg: product.tcg,
//           lang: product.lang,
//         }
//       : null,
//   );

//   return (
//     <div>
//       <div className="bg-raised">d</div>
//     </div>
//   );
// };

// const Analysis = ({ product }: { product: Product }) => {
//   return <div></div>;
// };

export const ProductOffers = ({
  id,
  name,
  code,
  rarity,
}: {
  id: number;
  name: string;
  code?: string;
  rarity?: string;
}) => {
  const [sortDesc, setSortDesc] = useState(false);
  const [forSale, setForSale] = useState<boolean | undefined>(true);
  const [forTrade, setForTrade] = useState<boolean | undefined>(undefined);
  const [hasStock, setHasStock] = useState<boolean | undefined>(true);

  const { data: offersPage, isLoading: isOffersLoading } = useOffers({
    productId: id,
    forSale,
    forTrade,
    hasStock,
    sortDesc,
  });

  const { data: market } = useMarketAnalysis(id);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-title">
          Ofertas
          {offersPage && ` (${offersPage.total})`}
          {market && (
            <span className="ml-2 text-sm font-normal text-content">
              Low {market.low_price.toFixed(2)} | Avg{" "}
              {market.average_price.toFixed(2)} | High{" "}
              {market.high_price.toFixed(2)} PEN
            </span>
          )}
        </h2>

        {/* Controls */}
        <div className="flex items-center gap-3 text-sm text-content">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forSale ?? false}
              onChange={() =>
                setForSale((v) => (v == null ? true : v ? undefined : true))
              }
              className="rounded border-surface"
            />
            Venta
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forTrade ?? false}
              onChange={() =>
                setForTrade((v) => (v == null ? true : v ? undefined : true))
              }
              className="rounded border-surface"
            />
            Intercambio
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasStock ?? false}
              onChange={() =>
                setHasStock((v) => (v == null ? true : v ? undefined : true))
              }
              className="rounded border-surface"
            />
            En stock
          </label>
          <button
            type="button"
            onClick={() => setSortDesc((v) => !v)}
            className="flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wider text-content hover:text-high transition-colors"
          >
            Precio {sortDesc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isOffersLoading && (
        <div className="border border-surface rounded-xl overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 animate-pulse"
            >
              <div className="h-4 w-28 bg-raised rounded" />
              <div className="h-3 w-14 bg-raised rounded" />
              <div className="flex-1">
                <div className="h-5 w-20 bg-raised rounded" />
              </div>
              <div className="h-4 w-8 bg-raised rounded" />
              <div className="h-8 w-8 bg-raised rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isOffersLoading && offersPage && offersPage.items.length === 0 && (
        <div className="border border-surface rounded-xl py-8 text-center text-sm text-content">
          No hay ofertas disponibles
        </div>
      )}

      {/* Rows */}
      {!isOffersLoading && offersPage && offersPage.items.length > 0 && (
        <div className="border border-surface rounded-xl overflow-hidden divide-y divide-gray-300 dark:divide-gray-700">
          {offersPage.items.map((offer) => (
            <div
              key={offer.stock_id}
              className="flex items-center gap-3 px-4 py-3 bg-surface"
            >
              {/* Seller */}
              <span className="text-sm font-semibold text-title w-28 shrink-0 truncate">
                {offer.user.name}
              </span>

              {/* Condition + Price */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-subtle capitalize">
                  {offer.condition.replace(/_/g, " ")}
                </p>
                {offer.discount > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base font-bold text-high">
                      {offer.discount_price.toFixed(2)} PEN
                    </span>
                    <span className="text-xs text-subtle line-through">
                      {offer.price.toFixed(2)} PEN
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      -{offer.discount}%
                    </span>
                  </div>
                ) : (
                  <p className="text-base font-bold text-high">
                    {offer.price.toFixed(2)} PEN
                  </p>
                )}
              </div>

              {/* Qty */}
              <span className="text-sm text-content w-12 text-right shrink-0">
                x{offer.quantity}
              </span>

              {/* Trade badge */}
              {offer.is_for_trade && (
                <span className="text-xs font-semibold text-indigo-500 dark:text-fuchsia-500 w-12 text-right shrink-0">
                  Trade
                </span>
              )}

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${offer.user.phone_number}?text=${encodeURIComponent(
                  [
                    `Hola ${offer.user.name}, me interesa tu oferta:`,
                    `${name}${code ? ` (${code})` : ""}${rarity ? ` - ${rarity}` : ""}`,
                    `${offer.discount > 0 ? offer.discount_price.toFixed(2) : offer.price.toFixed(2)} PEN`,
                  ].join("\n"),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                title="Contactar por WhatsApp"
              >
                <Icon icon="ic:baseline-whatsapp" className="text-lg" />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
