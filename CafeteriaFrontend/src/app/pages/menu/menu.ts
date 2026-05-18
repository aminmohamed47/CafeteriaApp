import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { MenuItem, Category } from '../../models/types';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private menuService: MenuService,
    public authService: AuthService,
    public cartService: CartService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadMenuItems();
  }

  loadCategories() {
    this.menuService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  loadMenuItems() {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching menu items:', err),
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategoryId) {
      this.filteredItems = this.menuItems.filter((item) => item.categoryId === this.selectedCategoryId);
    } else {
      this.filteredItems = this.menuItems;
    }
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    if (categoryId === null) {
      this.filteredItems = this.menuItems;
    } else {
      this.filteredItems = this.menuItems.filter(i => i.categoryId === categoryId);
    }
  }

  addToCart(item: MenuItem) {
    this.cartService.addToCart(item);
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name || 'General';
  }

  getTotalItems() {
    return this.cartService.getTotalItems();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
