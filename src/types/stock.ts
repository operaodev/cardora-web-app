import type { Product } from "@/types/product";

export type Condition =
  | "mint"
  | "near_mint"
  | "light_played"
  | "mod_played"
  | "heavy_played"
  | "damaged";

export type LogType =
  | "open_box"
  | "add"
  | "restock"
  | "sale"
  | "trade"
  | "return"
  | "gift"
  | "lost"
  | "damage"
  | "adjustment"
  | "rollback"
  | "price_change"
  | "discount_change";

export interface Log {
  id: number;
  stock_id: number;
  parent_log_id?: number | null;
  log_type: LogType;

  delta: number;
  previous_stock: number;
  new_stock: number;

  previous_price: number;
  new_price: number;
  previous_discount: number;
  new_discount: number;

  note?: string | null;
  parent_log?: Log | null;
  children?: Log[];

  created_at: string;
}

export interface Stock {
  id: number;
  user_id: string;
  product_id: number;
  condition: Condition;

  is_for_sale: boolean;
  is_for_trade: boolean;
  quantity: number;
  price: number;
  discount_price: number;

  product: Product;
  logs?: Log[];

  created_at: string;
  updated_at: string;
}

export interface CreateStockInput {
  product_id: number;
  condition: Condition;
  quantity: number;
  price: number;
  is_for_sale: boolean;
  is_for_trade: boolean;
  note?: string;
}

export interface QuantityInput {
  stock_id: number;
  amount: number;
  note?: string;
}

export interface DecreaseInput {
  stock_id: number;
  amount: number;
  note?: string;
}

export interface AdjustmentInput {
  stock_id: number;
  new_quantity: number;
  note?: string;
}

export interface RollbackInput {
  stock_id: number;
  log_id: number;
  note?: string;
}

export interface PriceInput {
  stock_id: number;
  price: number;
  discount_price?: number;
  note?: string;
}

export interface OpenBoxItem {
  product: {
    id: number;
    name: string;
    set_external_id: string;
    lang: string;
    code?: string;
  };
  quantity: number;
}

export interface OpenBoxInput {
  stock_id: number;
  quantity: number;
  items: OpenBoxItem[];
  note?: string;
}
