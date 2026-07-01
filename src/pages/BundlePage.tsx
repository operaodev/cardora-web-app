import { useState } from "react";
import {
  useBundles,
  useCreateBundle,
  useUpdateBundle,
  useDeleteBundle,
} from "@/hooks/useCustomPacks";
import { useMyStock } from "@/hooks/useStock";
import type { Bundle, BundleItem, BundleItemType } from "@/types/custom_packs";
import type { Stock } from "@/types/stock";
import { useExportStockImages } from "@/hooks/useExportStockImages";
import { Icon } from "@iconify-icon/react";

export default function BundlePage() {
  const { data: bundles, isLoading: loadingBundles } = useBundles();
   const { data: stockPage } = useMyStock({ limit: 1000 }); // Carga ítems de stock para la selección
   const allStock = stockPage?.items || [];
  
  const createMutation = useCreateBundle();
  const updateMutation = useUpdateBundle();
  const deleteMutation = useDeleteBundle();

   const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
   const [isCreating, setIsCreating] = useState(false);
   const [draftItems, setDraftItems] = useState<BundleItem[]>([]);
   const [stockSearch, setStockSearch] = useState("");
 
   const { exportImages, isExporting } = useExportStockImages();
 
   const handleExportBundle = (bundle: Bundle) => {
     const stocks = bundle.items
       ?.map((item) => item.stock)
       .filter((s): s is Stock => !!s) || [];
 
     if (stocks.length === 0) {
       alert("No hay ítems con stock cargado para exportar en este bundle.");
       return;
     }
     exportImages(stocks);
   };

   const resolvedBundles = bundles?.map((bundle) => ({
     ...bundle,
     items: bundle.items?.map((item) => ({
       ...item,
       stock: item.stock || allStock.find((s) => s.id === item.stock_id),
     })) || [],
   })) || [];
 
   const handleSelectBundle = (bundle: Bundle) => {
     const resolved = resolvedBundles.find((b) => b.id === bundle.id) || bundle;
     setSelectedBundle(resolved);
     setIsCreating(false);
     setDraftItems(resolved.items || []);
   };

  const handleStartCreate = () => {
    setSelectedBundle(null);
    setIsCreating(true);
    setDraftItems([]);
  };

  const handleAddStockToDraft = (stock: Stock) => {
    const exists = draftItems.some((item) => item.stock_id === stock.id);
    if (exists) return;

    const newItem: BundleItem = {
      stock_id: stock.id,
      quantity: 1,
      type: "sale",
      // Guardamos la referencia de stock para mostrar los detalles del producto en el frontend
      stock: stock,
    };
    setDraftItems([...draftItems, newItem]);
  };

  const handleRemoveItem = (stockId: number) => {
    setDraftItems(draftItems.filter((item) => item.stock_id !== stockId));
  };

  const handleUpdateItemQty = (stockId: number, qty: number) => {
    setDraftItems(
      draftItems.map((item) =>
        item.stock_id === stockId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const handleUpdateItemType = (stockId: number, type: BundleItemType) => {
    setDraftItems(
      draftItems.map((item) =>
        item.stock_id === stockId ? { ...item, type } : item
      )
    );
  };

  const handleSave = () => {
    if (draftItems.length === 0) {
      alert("Por favor, agrega al menos un ítem al bundle.");
      return;
    }

    const itemsPayload = draftItems.map((item) => ({
      stock_id: item.stock_id,
      quantity: item.quantity,
      type: item.type,
    }));

     if (isCreating) {
       createMutation.mutate(
         { items: itemsPayload },
         {
           onSuccess: (newBundle) => {
             setIsCreating(false);
             setDraftItems([]);
             // Automatically select the newly created bundle and map its stocks
             const resolved = {
               ...newBundle,
               items: newBundle.items?.map((item) => ({
                 ...item,
                 stock: item.stock || allStock.find((s) => s.id === item.stock_id),
               })) || [],
             };
             setSelectedBundle(resolved);
           },
         }
       );
     } else if (selectedBundle) {
       updateMutation.mutate(
         { bundleId: selectedBundle.id, items: itemsPayload },
         {
           onSuccess: (updated) => {
             const resolved = {
               ...updated,
               items: updated.items?.map((item) => ({
                 ...item,
                 stock: item.stock || allStock.find((s) => s.id === item.stock_id),
               })) || [],
             };
             setSelectedBundle(resolved);
             setDraftItems(resolved.items || []);
           },
         }
       );
     }
  };

  const handleDelete = () => {
    if (!selectedBundle) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este bundle?")) {
      deleteMutation.mutate(selectedBundle.id, {
        onSuccess: () => {
          setSelectedBundle(null);
          setDraftItems([]);
        },
      });
    }
  };

  const filteredStock = stockPage?.items?.filter((s) =>
    s.product.name.toLowerCase().includes(stockSearch.toLowerCase())
  ) || [];

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-title">Mis Bundles</h1>
        <p className="text-content text-sm">Gestiona tus paquetes de cartas para venta o regalo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado izquierdo: Lista de Bundles (Grilla de cuadrados) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Cuadrado de creación */}
            <button
              onClick={handleStartCreate}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-surface hover:border-indigo-500 rounded-xl p-4 transition duration-200 cursor-pointer bg-surface text-center hover:scale-102"
            >
              <span className="text-4xl font-light text-special">+</span>
              <span className="text-sm font-semibold text-title mt-2">Nuevo Bundle</span>
            </button>

             {loadingBundles ? (
              <div className="aspect-square flex items-center justify-center bg-surface border-surface rounded-xl">
                <span className="text-sm text-content font-medium">Cargando bundles...</span>
              </div>
            ) : (
               resolvedBundles?.map((bundle) => (
                <div
                  key={bundle.id}
                  onClick={() => handleSelectBundle(bundle)}
                  className={`aspect-square flex flex-col justify-between p-4 rounded-xl cursor-pointer card-surface relative ${
                    selectedBundle?.id === bundle.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-title">Bundle #{bundle.id}</h3>
                      <p className="text-xs text-content mt-1">
                        {bundle.items?.length || 0} { (bundle.items?.length || 0) === 1 ? "ítem" : "ítems" }
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportBundle(bundle);
                      }}
                      disabled={isExporting}
                      className="p-1.5 rounded-lg hover:bg-muted text-special transition-colors duration-150 flex items-center justify-center cursor-pointer"
                      title="Exportar a imagen"
                    >
                      <Icon icon="mdi:camera" width="20" height="20" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-16">
                    {bundle.items?.map((item) => (
                      <span
                        key={item.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-high font-medium truncate max-w-full"
                      >
                        {item.stock?.product?.name} ({item.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado derecho: Panel de edición / creación */}
        <div className="bg-surface border-surface border rounded-xl p-5 shadow-surface h-fit space-y-6">
          {selectedBundle || isCreating ? (
            <>
              <div className="flex justify-between items-center border-b border-surface pb-3">
                <h2 className="text-lg font-bold text-title">
                  {isCreating ? "Crear Nuevo Bundle" : `Editar Bundle #${selectedBundle?.id}`}
                </h2>
                {!isCreating && selectedBundle && (
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => handleExportBundle(selectedBundle)}
                      disabled={isExporting}
                      className="text-xs text-special hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Icon icon="mdi:camera" width="14" height="14" />
                      Exportar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Items agregados */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-content">
                  Ítems del Bundle
                </h3>
                {draftItems.length === 0 ? (
                  <p className="text-xs text-content italic py-4">No hay ítems agregados.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-surface pr-1">
                    {draftItems.map((item) => (
                      <div
                        key={item.stock_id}
                        className="flex items-center justify-between p-2 rounded bg-muted border border-surface text-xs"
                      >
                        <div className="truncate flex-1 pr-2">
                          <p className="font-semibold text-high truncate">
                            {item.stock?.product?.name || `Stock #${item.stock_id}`}
                          </p>
                          <p className="text-[10px] text-content">
                            Disponibles: {item.stock?.quantity || 1}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Tipo */}
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleUpdateItemType(item.stock_id, e.target.value as BundleItemType)
                            }
                            className="bg-surface border border-surface text-[10px] rounded p-1 text-high"
                          >
                            <option value="sale">Venta</option>
                            <option value="gift">Regalo</option>
                          </select>
                          {/* Cantidad */}
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItemQty(item.stock_id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center bg-surface border border-surface rounded p-1 text-high"
                          />
                          {/* Eliminar */}
                          <button
                            onClick={() => handleRemoveItem(item.stock_id)}
                            className="text-red-500 hover:text-red-600 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Búsqueda y Selección desde Stock */}
              <div className="space-y-3 pt-3 border-t border-surface">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-content">
                  Agregar desde mi Stock
                </h3>
                <input
                  type="text"
                  placeholder="Buscar en mi stock..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="input-base w-full"
                />
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-surface pr-1">
                  {filteredStock.map((s) => {
                    const isAdded = draftItems.some((item) => item.stock_id === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleAddStockToDraft(s)}
                        disabled={isAdded}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-xs transition duration-150 ${
                          isAdded
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "hover:bg-muted bg-surface border border-surface"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-high truncate">{s.product.name}</p>
                          <p className="text-[10px] text-content">
                            Cant: {s.quantity} | Rarity: {s.product.rarity || "Común"}
                          </p>
                        </div>
                        <span className="text-indigo-500 dark:text-fuchsia-500 font-semibold">
                          {isAdded ? "Añadido" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-surface flex gap-2">
                <button onClick={handleSave} className="btn-aurora text-xs py-2 flex-1">
                  Guardar Bundle
                </button>
                <button
                  onClick={() => {
                    setSelectedBundle(null);
                    setIsCreating(false);
                    setDraftItems([]);
                  }}
                  className="px-3 py-2 rounded-lg font-semibold text-xs border border-surface text-high hover:bg-muted transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-content">
                Selecciona un bundle o crea uno nuevo para empezar a editar e incluir ítems de tu stock.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}