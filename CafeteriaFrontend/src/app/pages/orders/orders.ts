import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    console.log('Starting to load orders...');
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        console.log('Orders emission received:', orders);
        this.zone.run(() => {
          this.orders = orders || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
        console.log('isLoading set to false, orders count:', this.orders.length);
      },
      error: (err) => {
        console.error('Subscription error in OrdersComponent:', err);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getStatusClass(status: any): string {
    if (!status) return 'pending';
    return typeof status === 'string' ? status.toLowerCase() : 'pending';
  }

  goBack() {
    this.router.navigate(['/menu']);
  }
}
