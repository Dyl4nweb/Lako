"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItemModel } from "@/types";

interface PendingSwitch {
  newStore: { id: string; name: string; slug: string; barangay: string };
  item: CartItemModel;
}

interface CartContextType {
  items: CartItemModel[];
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  storeBarangay: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalQuantity: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addItem: (
    store: { id: string; name: string; slug: string; barangay: string },
    item: CartItemModel
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  pendingSwitch: PendingSwitch | null;
  confirmStoreSwitch: () => void;
  cancelStoreSwitch: () => void;
  selectedBarangay: string;
  setSelectedBarangay: (barangay: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "movli_cart_v1";
const BARANGAY_STORAGE_KEY = "movli_barangay_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemModel[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [storeBarangay, setStoreBarangay] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);
  const [selectedBarangay, setSelectedBarangayState] = useState<string>("Poblacion");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setStoreId(parsed.storeId || null);
        setStoreName(parsed.storeName || null);
        setStoreSlug(parsed.storeSlug || null);
        setStoreBarangay(parsed.storeBarangay || null);
      }
      const savedBarangay = localStorage.getItem(BARANGAY_STORAGE_KEY);
      if (savedBarangay) {
        setSelectedBarangayState(savedBarangay);
      }
    } catch (e) {
      console.error("Failed to load cart state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ storeId, storeName, storeSlug, storeBarangay, items })
      );
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  }, [items, storeId, storeName, storeSlug, storeBarangay, isInitialized]);

  const setSelectedBarangay = (b: string) => {
    setSelectedBarangayState(b);
    try {
      localStorage.setItem(BARANGAY_STORAGE_KEY, b);
    } catch (e) {}
  };

  const addItem = (
    store: { id: string; name: string; slug: string; barangay: string },
    item: CartItemModel
  ) => {
    // If cart has items from a DIFFERENT store, enforce Single-Seller Rule
    if (storeId && storeId !== store.id && items.length > 0) {
      setPendingSwitch({ newStore: store, item });
      return;
    }

    setStoreId(store.id);
    setStoreName(store.name);
    setStoreSlug(store.slug);
    setStoreBarangay(store.barangay);

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const confirmStoreSwitch = () => {
    if (!pendingSwitch) return;
    const { newStore, item } = pendingSwitch;
    setStoreId(newStore.id);
    setStoreName(newStore.name);
    setStoreSlug(newStore.slug);
    setStoreBarangay(newStore.barangay);
    setItems([item]);
    setPendingSwitch(null);
  };

  const cancelStoreSwitch = () => {
    setPendingSwitch(null);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      if (next.length === 0) {
        setStoreId(null);
        setStoreName(null);
        setStoreSlug(null);
        setStoreBarangay(null);
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setStoreId(null);
    setStoreName(null);
    setStoreSlug(null);
    setStoreBarangay(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 45.0 : 0.0;
  const total = subtotal + deliveryFee;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        storeId,
        storeName,
        storeSlug,
        storeBarangay,
        subtotal,
        deliveryFee,
        total,
        totalQuantity,
        isDrawerOpen,
        setIsDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        pendingSwitch,
        confirmStoreSwitch,
        cancelStoreSwitch,
        selectedBarangay,
        setSelectedBarangay,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
