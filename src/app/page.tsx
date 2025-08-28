"use client";

import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 p-6">
      <h1 className="text-4xl font-bold">Welcome to Polling App 🎉</h1>
      <p className="text-lg max-w-xl text-gray-600">
        Create and participate in polls effortlessly. Vote, share, and see results instantly —
        all powered by Supabase + Next.js.
      </p>

      {user ? (
        <>
          <p className="text-green-600">✅ Logged in as {user.email}</p>
          <div className="space-x-4">
            <Link href="/polls">
              <Button>View Polls</Button>
            </Link>
            <Link href="/create-poll">
              <Button variant="outline">Create Poll</Button>
            </Link>
            <LogoutButton />
          </div>
        </>
      ) : (
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
