"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import { SingleStoreModal } from "@/components/shared/SingleStoreModal";
import { CartDrawer } from "@/components/shared/CartDrawer";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

export function Providers({
  children,
  currentSession,
  allUsers,
}: {
  children: React.ReactNode;
  currentSession: any;
  allUsers: any[];
}) {
  return (
    <CartProvider>
      <RoleSwitcher currentSession={currentSession} allUsers={allUsers} />
      <div className="flex-1 flex flex-col">{children}</div>
      <SingleStoreModal />
      <CartDrawer />
    </CartProvider>
  );
}
