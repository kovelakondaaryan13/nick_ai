"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-8 w-full rounded-lg border border-[#2A2A2A] py-3 text-sm font-medium text-[#F5F0E8] hover:bg-[#242424]"
    >
      Sign out
    </button>
  );
}
