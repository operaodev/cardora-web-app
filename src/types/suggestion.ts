import type { ProductType, TCG, LangCode } from "./product";

export interface SuggestionInput {
  tcg?: TCG;
  lang?: LangCode;
  input: string;
}

export interface SuggestionDTO {
  id: number;
  external_id: string;
  set_external_id: string;
  type: ProductType;
  tcg: TCG;
  wanted: number;
  name: string;
  code?: string;
  rarity?: string;
  rarity_code?: string;
  set_name?: string;
  set_code?: string;
  set_region_code: string;
  lang?: string;
  language?: LangCode;
  image?: string;
  edition?: string;
  /** Cantidad en inventario (solo si la petición va autenticada) */
  stock?: number;
  /** Cantidad en wishlist (solo si la petición va autenticada) */
  copies_in_wishlist?: number;
}
