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
      className="mt-8 w-full rounded-lg border border-[#ECECEC] py-3 text-sm font-medium hover:bg-[#FAFAF7]"
    >
      Sign out
    </button>
  );
}
