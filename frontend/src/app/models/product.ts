import { User } from "./user";

export interface ProductComment {
  _id?: string;
  clientId: string | User;  // converts to User object when populate is called
  text: string;
  date?: string;    // ISO string in JSON
}

export interface PrintingService {
  _id?: string;
  serviceId: string;
  printType: string;
  additionalPricePerPiece: number;
  maxWidthMm: number;
  maxHeightMm: number;
}

export interface Product {
  _id: string;
  printerId: string | User;

  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  unitPrice: number;
  stockQuantity: number;

  availableColors?: string[];
  imageUrl: string;
  additionalImages?: string[];

  printServices?: PrintingService[];

  likes: number;
  dislikes: number;
  likedBy?: string[];
  dislikedBy?: string[];
  comments?: ProductComment[];

  createdAt?: string;
  updatedAt: string;
}
