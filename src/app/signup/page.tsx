"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Check your email for the confirmation link.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 bg-white">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#111111]">Create your account</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Start cooking with Nick.</p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 text-sm text-[#111111] placeholder:text-[#6B7280] outline-none focus:border-[#2563EB]"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 text-sm text-[#111111] placeholder:text-[#6B7280] outline-none focus:border-[#2563EB]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-[#2563EB] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
