import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "T&A Competition",
  description: "Prepare For The Ass Wiping Of Your Life. Bitch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        <header className="border-b border-zinc-800">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              T<span className="text-amber-400">&amp;</span>A
            </Link>

            <div className="flex gap-6 text-sm text-zinc-300">
              <Link href="/tournaments">Tournaments</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/players">Players</Link>
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
