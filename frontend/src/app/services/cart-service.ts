import { inject, Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  getCart(userId: string) {
    return this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`);
  }

  addToCart(userId: string, formData: FormData) {
    return this.http.post<CartItem[]>(`${this.apiUrl}/${userId}/add`, formData);
  }

  updateQuantity(userId: string, productId: string, serviceId: string | null, quantity: number, color: string, text: string, image: string) {
    return this.http.put<CartItem[]>(`${this.apiUrl}/${userId}/update`, {
      productId,
      serviceId,
      quantity,
      selectedColor: color,
      customText: text,
      customImage: image
    });
  }

  removeFromCart(userId: string, productId: string, serviceId: string | null, color: string, text: string, image: string) {
    return this.http.put<CartItem[]>(`${this.apiUrl}/${userId}/remove`, {
      productId,
      serviceId,
      selectedColor: color,
      customText: text,
      customImage: image
    });
  }
}
