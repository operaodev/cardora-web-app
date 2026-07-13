import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { Icon } from "@iconify-icon/react";
import {
  ProductField,
  ProductImage,
  ProductInfo,
  ProductWishlistButton,
} from "@/components/product/product";
import { ProductOffers } from "@/components/product/productMarketpalce";
import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { ProductSidebar } from "@/components/product/ProductSidebar";
import { DraggableRelatedCard } from "@/components/product/DraggableRelatedCard";
import type { RelatedCardDTO } from "@/types/product";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  if (!id || isNaN(numericId)) {
    return <Navigate to={"*"} />;
  }

  return <ProductPageContent productId={numericId} />;
}

const ProductPageContent = ({ productId }: { productId: number }) => {
  const { data: product, isLoading, isError } = useProduct(productId);
  const navigate = useNavigate();
  const [comparedCardId, setComparedCardId] = useState<number | null>(null);
  const [activeDragData, setActiveDragData] = useState<RelatedCardDTO | null>(null);

  if (isError) {
    return <Navigate to={"/*"} />;
  }

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (product) {
    const {
      id,
      set_external_id,
      name,
      type,
      set_name,
      code,
      set_region_code,
      lang,
      edition,
      rarity,
      tags,
      set_type,
      archetype,
      description,
      wanted,
    } = product;
    const isCard = type === "card";

    const handleNavigateSet = () => {
      const params = new URLSearchParams();
      params.set("q", set_external_id);
      if (isCard) params.set("lang", lang);
      navigate(`/marketplace?${params.toString()}`);
    };

    const handleDragStart = (event: DragStartEvent) => {
      setActiveDragData((event.active.data.current as RelatedCardDTO) || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      setActiveDragData(null);
      if (event.over && event.over.id === "market-prices-box") {
        setComparedCardId(Number(event.active.id));
      } else {
        setComparedCardId(null);
      }
    };

    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="mx-auto w-11/12 pt-12 md:pt-16 pb-12 space-y-8">
          <div className="flex flex-col xl:flex-row gap-x-8 gap-y-8">
            
            {/* Left Column: Product Image */}
            <div className="w-full lg:w-[27%] shrink-0 mx-auto lg:mx-0">
              <ProductImage product={product} />
              {/* Aquí podrían ir las imágenes miniatura adicionales debajo si se cuenta con la data */}
            </div>

            {/* Middle Column: Main Product Details */}
            <div className="flex-1 space-y-5 min-w-0">
              <div className="flex gap-2 mb-2.5 items-center">
                <ProductWishlistButton productId={id} />
                <h1 className="text-title text-2xl font-bold">{name}</h1>
              </div>
              <div
                className="
                  flex items-center w-fit max-w-full pr-5
                  font-semibold text-sm text-nowrap
                  border-indigo-600 dark:border-fuchsia-600
                  border-2 bevel-full rounded-tr-full rounded-br-full
                "
              >
                <button
                  title={`Buscar ${set_external_id}`}
                  onClick={handleNavigateSet}
                  className="
                    flex items-center gap-1 truncate
                    bg-indigo-600 dark:bg-fuchsia-600
                    text-white py-2 pl-2 pr-4
                    rounded-tr-full rounded-br-full bevel-full
                  "
                >
                  <Icon icon="game-icons:cardboard-box-closed" className="text-2xl" />
                  <p className="truncate">{isCard ? set_name : set_external_id}</p>
                </button>
                <span className="py-2 pl-2 text-title">
                  {code || set_region_code}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <ProductField field="Edición" value={edition} />
                <ProductField field="Rareza" value={rarity} />
                <ProductField field="Categorías" value={isCard ? tags : set_type} />
                <ProductField field="Arquetipo" value={archetype} />
              </div>

              {isCard && (
                <div className="space-y-1">
                  <h3 className="text-high uppercase text-xs font-bold tracking-widest mb-2">
                    Descripción
                  </h3>
                  <p className="text-content text-sm leading-relaxed">{description}</p>
                </div>
              )}

              <div
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  rounded-full text-sm font-semibold
                  glass-aurora mt-2
                "
              >
                <Icon icon="mdi-eye" className="text-indigo-500 text-xl" />
                <p className="text-aurora">{wanted} búsquedas este mes</p>
              </div>

              <div className="pt-4">
                <details className="group border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden" open>
                  <summary className="text-sm font-bold tracking-wide text-high uppercase bg-gray-50 dark:bg-[#111111] p-4 cursor-pointer select-none flex items-center justify-between">
                    Más información
                    <Icon icon="mdi:chevron-down" className="text-xl transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white dark:bg-[#0a0a0a]">
                    {product.set_code && (
                      <ProductInfo label="Set code" value={product.set_code} />
                    )}
                    <ProductInfo label="Tipo" value={product.type} />
                    {product.lang && (
                      <ProductInfo label="Idioma" value={product.lang} />
                    )}
                    {product.serie_code && (
                      <ProductInfo label="Serie" value={product.serie_code} />
                    )}
                    {product.set_region_code && (
                      <ProductInfo label="Región" value={product.set_region_code} />
                    )}
                    {product.set_type && (
                      <ProductInfo label="Tipo de set" value={product.set_type} />
                    )}
                    {product.quantity_per_set > 0 && (
                      <ProductInfo
                        label="Cartas por set"
                        value={
                          product.quantity_per_set > 1
                            ? `${product.quantity_per_set} cartas`
                            : "1 carta"
                        }
                      />
                    )}
                    {product.quantity_per_box > 0 && (
                      <ProductInfo
                        label="Sobres por caja"
                        value={`${product.quantity_per_box}`}
                      />
                    )}
                  </div>
                </details>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-1/4 shrink-0 md:max-w-sm mx-auto lg:mx-0">
              <ProductSidebar product={product} comparedCardId={comparedCardId} />
            </div>
          </div>

          <ProductOffers id={id} name={name} code={code} rarity={rarity} />
        </main>

        <DragOverlay>
          {activeDragData ? (
            <DraggableRelatedCard card={activeDragData} isDraggingOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return null;
};

function ProductPageSkeleton() {
  return (
    <main className="mx-auto w-11/12 py-5 space-y-5 animate-pulse">
      {/* Title row */}
      <div className="flex gap-2 mb-2.5 items-center">
        <div className="w-6 h-6 bg-raised rounded" />
        <div className="h-6 bg-raised rounded w-48" />
      </div>

      {/* Set badge */}
      <div className="flex w-fit gap-1">
        <div className="h-9 w-32 bg-indigo-700 dark:bg-fuchsia-700 rounded" />
        <div className="h-9 w-16 bg-raised rounded" />
      </div>

      {/* Image */}
      <div className="bg-raised rounded-lg aspect-2/3 max-w-md" />

      {/* Fields grid */}
      <div className="flex justify-between flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 bg-raised rounded" />
            <div className="h-4 w-24 bg-raised rounded" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="h-4 w-24 bg-raised rounded" />
        <div className="h-3 w-full bg-raised rounded" />
        <div className="h-3 w-3/4 bg-raised rounded" />
      </div>

      {/* Wanted badge */}
      <div className="h-9 w-56 bg-raised rounded-full" />

      {/* HR */}
      <div className="h-px bg-surface" />

      {/* Details */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-raised rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-raised rounded" />
              <div className="h-4 w-20 bg-raised rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
