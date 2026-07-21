"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      setError("Incorrect admin PIN.");
      setSubmitting(false);
      return;
    }

    router.replace(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
          Admin access
        </p>
        <h1 className="mt-3 text-3xl font-black">Competition control room</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Enter the private PIN to manage draws, mentor picks, and results.
        </p>
        <label
          className="mt-6 block text-xs font-bold uppercase tracking-widest text-zinc-500"
          htmlFor="pin"
        >
          Admin PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400"
          required
        />
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-zinc-950 disabled:opacity-60"
        >
          {submitting ? "Checking…" : "Enter admin"}
        </button>
      </form>
    </main>
  );
}
