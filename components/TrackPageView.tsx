"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    // Ignora visite dalla pagina admin
    if (pathname.startsWith("/admin")) return;
    // Ignora visite di Stefano (loggato come admin)
    if (typeof window !== "undefined" && localStorage.getItem("spmab_admin") === "1") return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {}); // Silent fail
  }, [pathname]);

  return null;
}
