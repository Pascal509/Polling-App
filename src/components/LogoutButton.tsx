"use client";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function LogoutButton() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // ✅ clear user from context
    router.push("/auth/login");
  };

  // If user is logged in → show "Logout"
  if (user) {
    return <Button onClick={handleLogout}>Logout</Button>;
  }

  // If on login page → show "Register"
  if (pathname === "/auth/login") {
    return <Button onClick={() => router.push("/auth/register")}>Register</Button>;
  }

  // If on register page → show "Sign In"
  if (pathname === "/auth/register") {
    return <Button onClick={() => router.push("/auth/login")}>Sign In</Button>;
  }

  // Default (not logged in, not on auth pages) → show "Login"
  return <Button onClick={() => router.push("/auth/login")}>Login</Button>;
}
