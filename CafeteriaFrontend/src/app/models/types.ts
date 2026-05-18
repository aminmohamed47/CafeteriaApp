export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number;
  imageUrl: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  menuItems?: MenuItem[];
}

export interface Order {
  id: number;
  userName: string;
  createdAt: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
}

export interface OrderItem {
  itemName: string;
  price: number;
  quantity: number;
}

export interface UserDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  email: string;
  mobile: string;
}
