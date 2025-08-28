import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polling App",
  description: "A simple polling app with Supabase + Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <header className="p-4 shadow flex justify-between items-center">
            {/* ✅ Home link */}
            <Link href="/" className="font-bold text-lg hover:underline">
              Polling App
            </Link>

            {/* ✅ Dynamic button (logout / register / sign in) */}
            <LogoutButton />
          </header>

          <main className="p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
