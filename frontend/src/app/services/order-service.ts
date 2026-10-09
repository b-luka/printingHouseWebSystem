import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  checkout(userId: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/checkout`, { userId });
  }

  getClientOrders(clientId: string) {
    return this.http.get<Order[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getPrinterOrders(printerId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/printer/${printerId}`);
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.http.put<{message: string}>(`${this.apiUrl}/${orderId}/status`, { status });
  }

  cancelOrder(orderId: string) {
    return this.http.put<{message: string}>(`${this.apiUrl}/${orderId}/cancel`, {});
  }
}
