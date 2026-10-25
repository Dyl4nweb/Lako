export type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER" | "RIDER" | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED_TO_SELLER"
  | "CANCELLED_BY_CUSTOMER"
  | "REJECTED_BY_STORE";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  storeId?: string | null;
  riderProfileId?: string | null;
}

export interface CartItemModel {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface CartState {
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  storeBarangay: string | null;
  items: CartItemModel[];
}

export interface DeliveryAddressData {
  recipient: string;
  phoneNumber: string;
  barangay: string;
  street: string;
  landmark: string;
}
