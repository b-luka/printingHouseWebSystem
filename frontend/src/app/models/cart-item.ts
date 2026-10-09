import { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedServiceId: string | null;
  selectedColor: string;
  customText: string;
  customImage: string;
}
