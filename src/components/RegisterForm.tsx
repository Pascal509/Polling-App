"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`, // Supabase redirect after confirmation
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "✅ We've sent you a confirmation email. Please check your inbox and verify your account before logging in."
      );

      // Auto redirect to login page after 4s
      setTimeout(() => {
        router.push("/auth/login");
      }, 4000);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Register</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
