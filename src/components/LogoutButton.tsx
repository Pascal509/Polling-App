"use client";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
