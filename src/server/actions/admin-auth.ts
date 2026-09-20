"use server";

import { env } from "~/env";
import { cookies } from "next/headers";

export async function loginAction(username: string, password: string) {
  if (username === env.ADMIN_USER && password === env.ADMIN_PASS) {
    const cookieStore = await cookies();
    cookieStore.set("admin-session", "authenticated", { 
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    return { success: true };
  }
  return { success: false, error: "Invalid username or password" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-session");
}

export async function checkSession() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}
