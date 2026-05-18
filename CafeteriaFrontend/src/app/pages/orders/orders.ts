import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { Order } from '../../models/types';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    console.log('Starting to load orders...');
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        console.log('Orders emission received:', orders);
        this.orders = orders || [];
        this.isLoading = false;
        console.log('isLoading set to false, orders count:', this.orders.length);
      },
      error: (err) => {
        console.error('Subscription error in OrdersComponent:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string) {
    return status.toLowerCase();
  }

  goBack() {
    this.router.navigate(['/menu']);
  }
}
