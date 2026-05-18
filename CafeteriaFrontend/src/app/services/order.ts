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

  private mapOrders(orders: any[]): Order[] {
    if (!Array.isArray(orders)) return [];
    
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'Preparing',
      2: 'Ready',
      3: 'Delivered'
    };

    return orders.map(o => {
      if (!o) return {} as Order;
      
      const rawStatus = o.status !== undefined ? o.status : o.Status;
      let statusStr = 'Pending';
      if (rawStatus !== undefined && rawStatus !== null) {
        if (typeof rawStatus === 'number') {
          statusStr = statusMap[rawStatus] || 'Pending';
        } else if (typeof rawStatus === 'string') {
          const parsed = parseInt(rawStatus, 10);
          if (!isNaN(parsed) && statusMap[parsed] !== undefined) {
            statusStr = statusMap[parsed];
          } else {
            statusStr = rawStatus;
          }
        }
      }

      // Safeguard items array defensively, supporting both camelCase and PascalCase
      const rawItems = o.items !== undefined ? o.items : o.Items;
      const mappedItems = Array.isArray(rawItems) ? rawItems.map((item: any) => {
        if (!item) return { itemName: 'Unknown Item', price: 0, quantity: 1 };
        const itemName = item.itemName !== undefined ? item.itemName : (item.ItemName !== undefined ? item.ItemName : 'Unknown Item');
        const priceVal = item.price !== undefined ? item.price : item.Price;
        const qtyVal = item.quantity !== undefined ? item.quantity : item.Quantity;
        return {
          itemName: itemName,
          price: typeof priceVal === 'number' ? priceVal : parseFloat(priceVal) || 0,
          quantity: typeof qtyVal === 'number' ? qtyVal : parseInt(qtyVal, 10) || 1
        };
      }) : [];

      // Safeguard totalPrice defensively, supporting both camelCase and PascalCase
      const rawTotalPrice = o.totalPrice !== undefined ? o.totalPrice : o.TotalPrice;
      let totalPrice = 0;
      if (rawTotalPrice !== undefined && rawTotalPrice !== null) {
        totalPrice = typeof rawTotalPrice === 'number' ? rawTotalPrice : parseFloat(rawTotalPrice) || 0;
      } else {
        totalPrice = mappedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      }

      const idVal = o.id !== undefined ? o.id : o.Id;
      const userNameVal = o.userName !== undefined ? o.userName : o.UserName;
      const createdAtVal = o.createdAt !== undefined ? o.createdAt : o.CreatedAt;

      return {
        id: idVal || 0,
        userName: userNameVal || 'Customer',
        createdAt: createdAtVal || new Date().toISOString(),
        status: statusStr,
        items: mappedItems,
        totalPrice: totalPrice
      };
    });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/Order`).pipe(
      tap(res => console.log('My Orders:', res)),
      map((res) => {
        let rawOrders: any[] = [];
        if (Array.isArray(res)) {
          rawOrders = res;
        } else if (res && res.results && Array.isArray(res.results)) {
          rawOrders = res.results;
        }
        return this.mapOrders(rawOrders);
      }),
      catchError(err => { console.error('Error in getMyOrders:', err); return throwError(() => err); })
    );
  }

  placeOrder(items: { menuItemId: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/Order`, items);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/Order/all`).pipe(
      tap(res => console.log('All Orders:', res)),
      map((res) => {
        let rawOrders: any[] = [];
        if (Array.isArray(res)) {
          rawOrders = res;
        } else if (res && res.results && Array.isArray(res.results)) {
          rawOrders = res.results;
        }
        return this.mapOrders(rawOrders);
      }),
      catchError(err => { console.error('Error in getAllOrders:', err); return throwError(() => err); })
    );
  }

  updateStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Order/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
