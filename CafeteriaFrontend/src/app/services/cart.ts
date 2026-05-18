import { Injectable } from '@angular/core';
import { MenuItem } from '../models/types';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  addToCart(item: MenuItem) {
    const existing = this.cartItems.find((i) => i.item.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ item, quantity: 1 });
    }
    this.cartSubject.next([...this.cartItems]);
  }

  updateQuantity(itemId: number, change: number) {
    const existing = this.cartItems.find((i) => i.item.id === itemId);
    if (existing) {
      existing.quantity += change;
      if (existing.quantity <= 0) {
        this.removeItem(itemId);
      } else {
        this.cartSubject.next([...this.cartItems]);
      }
    }
  }

  removeItem(itemId: number) {
    this.cartItems = this.cartItems.filter((i) => i.item.id !== itemId);
    this.cartSubject.next([...this.cartItems]);
  }

  clearCart() {
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  getCart() {
    return this.cartItems;
  }

  getTotalItems() {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalPrice() {
    return this.cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  }
}
