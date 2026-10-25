export type Role = "CUSTOMER" | "ADMIN" | "RIDER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD";

export type PaymentCollectionStatus = "UNCOLLECTED" | "COLLECTED";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
  categoryName?: string;
}

export interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNotes?: string;
}

export interface ProductFormData {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  published?: boolean;
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface AdminStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  activeDeliveries: number;
  deliveredSales: number;
  pendingOrders: number;
}
