"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 bg-[#0F0F0F]">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F5F0E8]">Welcome back</h1>
        <p className="mt-1 text-sm text-[#9A9A8A]">Sign in to cook with Nick.</p>
      </div>

      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#9A9A8A] outline-none focus:border-[#FF6B35]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#9A9A8A] outline-none focus:border-[#FF6B35]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#9A9A8A]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-[#FF6B35] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
