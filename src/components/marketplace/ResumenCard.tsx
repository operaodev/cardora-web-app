import { Link } from "react-router-dom";
import type { ProductResume } from "@/types/marketplace";

export function SkeletonCard() {
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

export const ResumenCard = ({ resumen }: { resumen: ProductResume }) => {
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
      <div className="flex flex-col gap-3">
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
            <h1 className="font-bold text-xl">{Number(average_price || 0).toFixed(2)} PEN</h1>
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
