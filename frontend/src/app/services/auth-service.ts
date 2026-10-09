import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);
  private router = inject(Router);

  login(username: string, password: string) {
    const data = { username, password };
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(formData: FormData) {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  updateProfile(formData: FormData) {
    return this.http.put(`${this.apiUrl}/update`, formData);
  }

  saveToken(token: string) {
    localStorage.setItem('login_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('login_token');
  }

  logout() {
    localStorage.removeItem('login_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user');
  }
}
