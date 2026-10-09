import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private http = inject(HttpClient);

  getPendingUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/users/pending`);
  }

  updateUserStatus(userId: string, status: 'approved' | 'rejected') {
    return this.http.put(`${this.apiUrl}/users/${userId}/status`, { status });
  }

  getAllUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(userId: string) {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  updateUserDetails(userId: string, userData: any) {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData);
  }

  getAllCategories() {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  addCategory(name: string) {
    return this.http.post<Category>(`${this.apiUrl}/categories`, { name });
  }

  addSubcategory(categoryName: string, subcategoryName: string) {
    return this.http.post<Category>(`${this.apiUrl}/subcategories`, { categoryName, subcategoryName });
  }

  getTopPrinters() {
    return this.http.get<any[]>(`${this.apiUrl}/stats/printers`);
  }

  getTopProducts() {
    return this.http.get<any[]>(`${this.apiUrl}/stats/products`);
  }
}
