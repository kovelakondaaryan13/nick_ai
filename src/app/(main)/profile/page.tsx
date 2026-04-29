import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";
import ProfileTasteEditor from "./taste-editor";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_initial, taste_fingerprint, dietary_flags, allergens, kitchen_tools, meals_count, joined_at, notif_prefs")
    .eq("user_id", user.id)
    .single();

  const joined = profile?.joined_at
    ? new Date(profile.joined_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    : "";

  const dietSummary = [
    profile?.dietary_flags?.vegetarian && "vegetarian",
    profile?.dietary_flags?.gluten_free && "gluten-free",
    profile?.allergens?.length ? `${profile.allergens.length} allergen${profile.allergens.length > 1 ? "s" : ""}` : false,
  ]
    .filter(Boolean)
    .join(" · ") || "none set";

  const toolCount = profile?.kitchen_tools?.length || 0;
  const notifStatus = profile?.notif_prefs?.suggestions !== false ? "on" : "off";

  const settingsRows = [
    { label: "Dietary needs", subtitle: dietSummary, href: "/profile/dietary" },
    { label: "Kitchen tools", subtitle: `${toolCount} items`, href: "/profile/tools" },
    { label: "Notifications", subtitle: `meal reminders ${notifStatus}`, href: "/profile/notifications" },
    { label: "Shopping list", subtitle: "view & sync", href: "/shopping-list" },
    { label: "Privacy & data", subtitle: "export or delete", href: "/profile/privacy" },
  ];

  return (
    <div className="px-4 pt-12 pb-4 bg-[#0F0F0F] min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#F5F0E8] font-[family-name:var(--font-playfair)]">Profile</h1>
        <Link href="/profile/settings" className="p-2" aria-label="Settings">
          <Settings className="h-5 w-5 text-[#9A9A8A]" />
        </Link>
      </div>

      {/* Avatar + name */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6B35] text-2xl font-bold text-white">
          {profile?.avatar_initial || "?"}
        </div>
        <div>
          <p className="text-base font-semibold text-[#F5F0E8]">{profile?.display_name || user.email}</p>
          <p className="text-xs text-[#9A9A8A]">
            {profile?.meals_count || 0} meals · joined {joined}
          </p>
          <Link
            href="/profile/edit"
            className="mt-1 inline-block rounded-full border border-dashed border-[#2A2A2A] px-3 py-1 text-[10px] font-medium text-[#9A9A8A]"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Taste fingerprint */}
      <div className="mt-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9A9A8A]">
          Taste Fingerprint
        </p>
        <ProfileTasteEditor current={profile?.taste_fingerprint || []} />
      </div>

      {/* Settings rows */}
      <div className="mt-6 divide-y divide-[#2A2A2A] rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]">
        {settingsRows.map((row) => (
          <Link
            key={row.href}
            href={row.href}
            className="flex items-center justify-between px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-medium text-[#F5F0E8]">{row.label}</p>
              <p className="text-xs text-[#9A9A8A]">{row.subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#9A9A8A]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
