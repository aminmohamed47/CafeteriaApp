import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu';
import { OrderService } from '../../services/order';
import { MenuItem, Category, Order } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent implements OnInit {
  orders: Order[] = [];
  categories: Category[] = [];
  menuItems: MenuItem[] = [];
  activeTab: 'orders' | 'menu' = 'orders';
  isOrdersLoading = true;
  isEditing = false;
  editingId: number | null = null;

  // Form Model
  newItem: any = {
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    imageUrl: '',
    isAvailable: true
  };

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isOrdersLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: res => {
        this.zone.run(() => {
          this.orders = res;
          this.isOrdersLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.isOrdersLoading = false;
          this.cdr.detectChanges();
        });
      }
    });

    this.menuService.getCategories().subscribe(res => {
      this.zone.run(() => {
        this.categories = res;
        if (this.categories.length > 0) this.newItem.categoryId = this.categories[0].id;
        this.cdr.detectChanges();
      });
    });

    this.menuService.getMenuItems().subscribe(res => {
      this.zone.run(() => {
        this.menuItems = res;
        this.cdr.detectChanges();
      });
    });
  }

  updateOrderStatus(orderId: number, status: string) {
    this.orderService.updateStatus(orderId, status).subscribe(() => {
      this.zone.run(() => {
        this.loadAll();
      });
    });
  }

  saveMenuItem() {
    if (this.isEditing && this.editingId) {
      this.menuService.updateMenuItem(this.editingId, this.newItem).subscribe(() => {
        this.zone.run(() => {
          alert('Item updated successfully! 🔄');
          this.resetForm();
          this.loadAll();
        });
      });
    } else {
      this.menuService.createMenuItem(this.newItem).subscribe(() => {
        this.zone.run(() => {
          alert('New item added successfully! ✅');
          this.resetForm();
          this.loadAll();
        });
      });
    }
  }

  editItem(item: MenuItem) {
    this.isEditing = true;
    this.editingId = item.id;
    this.newItem = { ...item };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.newItem = { name: '', description: '', price: 0, categoryId: this.categories[0]?.id, imageUrl: '', isAvailable: true };
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.zone.run(() => {
          this.newItem.imageUrl = e.target.result;
          this.cdr.detectChanges();
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.newItem.imageUrl = '';
    this.cdr.detectChanges();
  }

  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.menuService.deleteMenuItem(id).subscribe(() => {
        this.zone.run(() => {
          this.loadAll();
        });
      });
    }
  }

  getStatusClass(status: any): string {
    if (!status) return 'pending';
    return typeof status === 'string' ? status.toLowerCase() : 'pending';
  }

  goBack() {
    this.router.navigate(['/menu']);
  }
}
