import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private userApiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);

  getPrintersCount(): Observable<{ count: number }> {
    return this.http.get<{count: number}>(`${this.userApiUrl}/printers/count`);
  }

  getTopProducts() {
    return this.http.get<Product[]>(`${this.apiUrl}/top`);
  }

  getActiveCategories() {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getAllCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/all-categories`);
  }

  searchProducts(name: string, category: string) {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (category) params = params.set('category', category);

    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  getProductById(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  likeProduct(productId: string, userId: string) {
    return this.http.post<Product>(`http://localhost:4000/api/products/${productId}/like`, { userId });
  }

  dislikeProduct(productId: string, userId: string) {
    return this.http.post<Product>(`http://localhost:4000/api/products/${productId}/dislike`, { userId });
  }

  addComment(productId: string, userId: string, text: string) {
    return this.http.post<Product>(`http://localhost:4000/api/products/${productId}/comment`, { userId, text });
  }

  addProduct(formData: FormData) {
    return this.http.post<Product>(`${this.apiUrl}/add`, formData);
  }

  getProductsByPrinter(printerId: string) {
    return this.http.get<Product[]>(`${this.apiUrl}/printer/${printerId}`);
  }

  updateStock(productId: string, newQuantity: number) {
    return this.http.put<{message: string}>(`${this.apiUrl}/${productId}/quantity`, { newQuantity });
  }

  addBulkProducts(payload: { printerId: string, products: any[] }) {
    return this.http.post<{ message: string, products: any[] }>(`${this.apiUrl}/bulk`, payload);
  }
}
