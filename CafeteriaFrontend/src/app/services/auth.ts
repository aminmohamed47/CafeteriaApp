import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, RegisterDto } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7199/api/auth';

  constructor(private http: HttpClient) {}

  login(dto: UserDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, dto);
  }

  register(dto: RegisterDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, dto);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin';
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
