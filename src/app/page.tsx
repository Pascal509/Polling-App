"use client";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";


export default function Home() {
  const { user } = useAuth();

  return (
      <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Polling App</h1>
      {user ? (
        <>
          <p>✅ Logged in as {user.email}</p>
          <LogoutButton />
        </>
      ) : (
        <p>❌ Not logged in. Go to /auth/login or /auth/register</p>
      )}
    </main>
  );
}
