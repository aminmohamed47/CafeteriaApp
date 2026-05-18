import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { CartService, CartItem } from '../../services/cart';
import { MenuItem } from '../../models/types';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  isPlacingOrder = false;

  constructor(
    private router: Router,
    private orderService: OrderService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
    });
  }

  getTotalPrice() {
    return this.cartService.getTotalPrice();
  }

  updateQuantity(item: MenuItem, change: number) {
    this.cartService.updateQuantity(item.id, change);
  }

  removeItem(item: MenuItem) {
    this.cartService.removeItem(item.id);
  }

  placeOrder() {
    if (this.cart.length === 0) return;

    this.isPlacingOrder = true;
    const items = this.cart.map(c => ({
      menuItemId: c.item.id,
      quantity: c.quantity
    }));

    this.orderService.placeOrder(items).subscribe({
      next: () => {
        alert('Order placed successfully! 🎉');
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error(err);
        alert('Failed to place order. Please try again.');
        this.isPlacingOrder = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/menu']);
  }
}
