"use client";

import { useState, useEffect, useRef } from "react";
import { X, Share, PlusSquare } from "lucide-react";

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    if (localStorage.getItem("pwa_install_dismissed")) return;

    const sessions = parseInt(localStorage.getItem("pwa_session_count") || "0") + 1;
    localStorage.setItem("pwa_session_count", sessions.toString());

    if (sessions < 3) return;

    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      await deferredPromptRef.current.userChoice;
    }
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg">
      <button onClick={dismiss} className="absolute right-3 top-3">
        <X className="h-4 w-4 text-[#6B7280]" />
      </button>
      <h3 className="text-sm font-bold text-[#111111]">Add Nick AI to Home Screen</h3>
      {isIOS ? (
        <div className="mt-2 text-xs text-[#6B7280] leading-relaxed">
          <p className="flex items-center gap-1">
            Tap <Share className="inline h-3.5 w-3.5" /> then <PlusSquare className="inline h-3.5 w-3.5" /> &quot;Add to Home Screen&quot;
          </p>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button onClick={dismiss} className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-xs font-medium text-[#111111]">
            Not now
          </button>
          <button onClick={handleInstall} className="flex-1 rounded-lg bg-[#2563EB] py-2.5 text-xs font-semibold text-white">
            Install
          </button>
        </div>
      )}
    </div>
  );
}
