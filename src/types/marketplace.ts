export interface MarketAnalysis {
  product_id: number;
  low_price: number;
  average_price: number;
  high_price: number;
  market_stock: number;
}

export interface OfferUser {
  id: string;
  name: string;
  email_verified: boolean;
  created_at: string;
}

export interface Offer {
  user: OfferUser;
  stock_id: number;
  condition: string;
  is_for_trade: boolean;
  price: number;
  discount_price: number;
  discount: number;
  quantity: number;
}

export interface OffersPage {
  items: Offer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OffersInput {
  productId: number;
  forSale?: boolean;
  forTrade?: boolean;
  hasStock?: boolean;
  sortDesc?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductResume {
  id: number;
  name: string;
  code?: string;
  set_name?: string;
  rarity?: string;
  rarity_code?: string;
  image?: string;
  global_stock: number;
  average_price: number;
}

export interface ProductResumePage {
  items: ProductResume[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FilterInput {
  input: string;
  tcgs?: string[];
  langs?: string[];
  page?: number;
  limit?: number;
  product_Type?: string;
}
 