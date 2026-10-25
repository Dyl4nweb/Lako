"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function registerCustomerAction(formData: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  try {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid registration details.",
      };
    }

    const { name, email, phone, password } = validated.data;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    // Call Better Auth to create user & password hash
    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!res?.user?.id) {
      return { success: false, error: "Failed to register user account." };
    }

    // Ensure phone and default role are set
    await prisma.user.update({
      where: { id: res.user.id },
      data: {
        phone,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    return { success: true, user: res.user };
  } catch (error: unknown) {
    console.error("Registration action error:", error);
    return {
      success: false,
      error: (error as Error)?.message || "Registration failed. Please try again.",
    };
  }
}
