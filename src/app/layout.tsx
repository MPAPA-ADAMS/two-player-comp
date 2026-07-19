import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "2 Player Competition",
  description: "An eight-player tournament season.",
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
            <Link href="/" className="text-lg font-bold">
              2PC
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
