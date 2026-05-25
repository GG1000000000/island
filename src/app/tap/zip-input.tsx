"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ZipInput({ initial = "" }: { initial?: string }) {
  const [z, setZ] = useState(initial);
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const clean = z.trim().replace(/\D/g, "").padStart(5, "0").slice(-5);
        if (/^\d{5}$/.test(clean)) router.push(`/tap/${clean}`);
      }}
      className="flex gap-2 max-w-md"
    >
      <input
        type="text"
        value={z}
        onChange={(e) => setZ(e.target.value)}
        placeholder="enter a US ZIP code"
        maxLength={10}
        inputMode="numeric"
        autoFocus
        className="flex-1 px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 text-lg tabular-nums"
      />
      <button
        type="submit"
        className="px-5 py-3 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors text-sm font-medium"
      >
        Check
      </button>
    </form>
  );
}
