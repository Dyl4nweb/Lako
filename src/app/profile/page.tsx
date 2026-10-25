import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  PackageCheck,
  Calendar,
  LogOut,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionData = await getServerSession();
  if (!sessionData || !sessionData.user) {
    redirect("/login?redirect=/profile");
  }

  const userId = sessionData.user.id;

  let dbUser = null;
  let orderCount = 0;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    orderCount = await prisma.order.count({
      where: { customerId: userId },
    });
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
  }

  const user = dbUser || sessionData.user;
  const userRole = (user as unknown as { role?: string })?.role || "CUSTOMER";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 border border-orange-200 text-orange-700 font-black text-2xl flex items-center justify-center">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {userRole} Account
                  </span>
                  <span className="text-xs text-neutral-500">
                    Active Movli Member
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-xs font-bold bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <PackageCheck className="w-4 h-4" />
              <span>View Orders ({orderCount})</span>
            </Link>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Email Address</span>
              </span>
              <p className="text-sm font-bold text-neutral-900">{user.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Contact Phone</span>
              </span>
              <p className="text-sm font-bold text-neutral-900">
                {(user as unknown as { phone?: string })?.phone || "No phone added yet"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Total Orders Placed</span>
              </span>
              <p className="text-sm font-bold text-neutral-900">{orderCount} completed orders</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Account Member Since</span>
              </span>
              <p className="text-sm font-bold text-neutral-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PH") : "Active"}
              </p>
            </div>
          </div>

          {/* Quick role navigations if user has elevated roles */}
          {userRole === "ADMIN" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-900">Administrator Access Enabled</h4>
                <p className="text-[11px] text-amber-700">
                  You have full marketplace administrative privileges.
                </p>
              </div>
              <Link
                href="/admin"
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Open Admin Portal
              </Link>
            </div>
          )}

          {userRole === "RIDER" && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900">Rider Partner Access</h4>
                <p className="text-[11px] text-blue-700">
                  View and update your assigned parcel deliveries.
                </p>
              </div>
              <Link
                href="/rider"
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Open Rider Terminal
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
