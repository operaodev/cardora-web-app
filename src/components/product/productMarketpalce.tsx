import { useMarketAnalysis } from "@/hooks/useMarketplace";
import { useRelatedCards } from "@/hooks/useProduct";
import type { Product } from "@/types/product";

export const ProductAnalysis = ({ product }: { product: Product }) => {
  const { id } = product;
  const { data: market } = useMarketAnalysis(id);
  const { data: relatedCards, isLoading: isRelatedLoading } = useRelatedCards(
    product
      ? {
          id: product.id,
          external_id: product.external_id,
          set_external_id: product.set_external_id,
          tcg: product.tcg,
          lang: product.lang,
        }
      : null,
  );

  return (
    <div >
      <div className="bg-raised">
        d
      </div>
    </div>
  );
};

const Analysis = ({ product }: { product: Product }) => {
  return (
    <div>
    </div>
  );
};