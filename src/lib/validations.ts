import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: z
    .string()
    .min(7, "Please provide a valid phone number")
    .max(20, "Phone number is too long"),
  deliveryAddress: z
    .string()
    .min(5, "Delivery address must be detailed (House/Street/Barangay/City)")
    .max(300),
  orderNotes: z.string().max(500).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(120),
  description: z.string().min(5, "Please provide a descriptive product overview"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  imageUrl: z.string().url("Must be a valid image URL"),
  categoryId: z.string().min(1, "Please select a category"),
  published: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(60),
  description: z.string().max(300).optional(),
  imageUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export const riderAssignmentSchema = z.object({
  orderId: z.string().min(1),
  riderId: z.string().min(1),
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "ASSIGNED",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().optional(),
  markCollected: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
