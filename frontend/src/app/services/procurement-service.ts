import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Procurement } from '../models/procurement';

@Injectable({
  providedIn: 'root',
})
export class ProcurementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/procurements`;

  startProcurement(userId: string) {
    return this.http.post<{message: string}>(`${this.apiUrl}/start`, { userId });
  }

  getClientProcurements(clientId: string) {
    return this.http.get<Procurement[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getActiveProcurements() {
    return this.http.get<Procurement[]>(`${this.apiUrl}/active`);
  }

  getPastProcurements() {
    return this.http.get<Procurement[]>(`${this.apiUrl}/past`);
  }

  placeOffer(procurementId: string, printerId: string, totalPrice: number) {
    return this.http.post<{message: string}>(`${this.apiUrl}/bid`, { procurementId, printerId, totalPrice });
  }

  downloadProcurementReport(procurementId: string) {
    return this.http.get(`${this.apiUrl}/${procurementId}/report`, { responseType: 'blob' }); // responseType: blob so angular parses as pdf
  }
}
