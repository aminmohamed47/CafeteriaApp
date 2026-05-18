import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, map, throwError } from 'rxjs';
import { MenuItem, Category } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = 'https://localhost:7199/api';

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/Menu`).pipe(
      tap(items => console.log('Fetched Menu Items:', items)),
      map((res: any) => res.results || res),
      catchError(err => { 
        console.error('Error fetching menu:', err); 
        return throwError(() => err); 
      })
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/Category`).pipe(
      tap(cats => console.log('Fetched Categories:', cats)),
      map((res: any) => res.results || res),
      catchError(err => { 
        console.error('Error fetching categories:', err); 
        return throwError(() => err); 
      })
    );
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/Menu`, item);
  }

  updateMenuItem(id: number, item: MenuItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Menu/${id}`, item);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Menu/${id}`);
  }
}
