"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          }
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show banner if user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "1");
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-bg-card/95 backdrop-blur-md border border-amber-500/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg-secondary border border-border flex items-center justify-center shrink-0">
          <div className="w-4 h-4 bg-amber-400 rotate-45" />
        </div>
        <div>
          <div className="text-xs font-bold text-text-primary">Cài đặt ứng dụng LEIBO</div>
          <div className="text-[11px] text-text-muted">Trải nghiệm mượt mà, tra cứu ngoại tuyến</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-bg-primary font-bold text-xs transition-colors shadow-sm"
        >
          Cài đặt
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors text-xs"
          title="Đóng"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
