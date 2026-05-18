import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { Order, OrderItem } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'https://localhost:7199/api';

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/Order`).pipe(
      tap(res => console.log('My Orders:', res)),
      map((res) => res.results || res),
      catchError(err => { console.error('Error in getMyOrders:', err); return throwError(() => err); })
    );
  }

  placeOrder(items: { menuItemId: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/Order`, items);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/Order/all`).pipe(
      tap(res => console.log('All Orders:', res)),
      map((res) => res.results || res),
      catchError(err => { console.error('Error in getAllOrders:', err); return throwError(() => err); })
    );
  }

  updateStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Order/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
