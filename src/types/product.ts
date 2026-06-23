export type ProductType = "set" | "card";
export type TCG = "" | "ygo";
export type LangCode =
  | ""
  | "EN"
  | "FR"
  | "DE"
  | "IT"
  | "PT"
  | "SP"
  | "JP"
  | "AE"
  | "KR"
  | "TC"
  | "SC";

export interface CardImage {
  image_url: string;
  image_url_small?: string;
  image_url_cropped?: string;
}

export interface Product {
  id: number;
  type: ProductType;

  external_id: string;
  set_external_id: string;
  tcg: TCG;
  code?: string;
  lang: LangCode;
  rarity?: string;

  name: string;
  set_name: string;
  set_code?: string;
  rarity_code?: string;
  archetype?: string;
  wanted: number;

  description?: string;
  tags?: string;
  images?: CardImage[];
  serie_code?: string;

  edition?: string;
  print_url_small?: string;
  print_url_large?: string;
  quantity_per_set: number;

  set_region_code?: string;
  set_type?: string;
  set_image?: string;
  set_image_small?: string;
  set_image_large?: string;
  quantity_per_box: number;

  total_stock?: number;
  low_price?: number;
  average_price?: number;
  high_price?: number;

  created_at: string;
  updated_at: string;
}

export interface RelatedCardDTO {
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
  lang: string;
  image?: string;
  edition?: string;
}

export interface RelatedCardsResponse {
  same_lang_different_rarity: RelatedCardDTO[];
  different_lang: RelatedCardDTO[];
}

export interface RelatedCardsInput {
  id: number;
  external_id: string;
  set_external_id: string;
  tcg: TCG;
  lang: string;
}

export interface GetCardsBySetInput {
  set_external_id: string;
  lang: string;
}
