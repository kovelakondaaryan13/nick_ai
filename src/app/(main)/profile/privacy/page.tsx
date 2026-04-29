"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PrivacyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/me/export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nick-ai-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await fetch("/api/me", { method: "DELETE" });
      await supabase.auth.signOut();
      router.push("/signin");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Privacy & Data</h1>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={exportData}
          disabled={exporting}
          className="flex w-full items-center gap-3 rounded-xl border border-[#ECECEC] bg-white px-4 py-3.5"
        >
          <Download className="h-5 w-5 text-[#6B6B6B]" />
          <div className="text-left">
            <p className="text-sm font-medium">{exporting ? "Exporting..." : "Export my data"}</p>
            <p className="text-xs text-[#6B6B6B]">Download all your data as JSON</p>
          </div>
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
        >
          <Trash2 className="h-5 w-5 text-red-500" />
          <div className="text-left">
            <p className="text-sm font-medium text-red-600">Delete account</p>
            <p className="text-xs text-red-400">Permanently remove all data</p>
          </div>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-base font-bold">Delete your account?</h2>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              This will permanently delete your profile, chat history, cook sessions, and all saved data. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full border border-[#ECECEC] py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
