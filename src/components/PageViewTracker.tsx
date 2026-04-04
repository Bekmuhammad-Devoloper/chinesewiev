"use client";

import { useEffect } from "react";

export default function PageViewTracker({ page = "/" }: { page?: string }) {
  useEffect(() => {
    // Har bir sahifa yuklanishda faqat 1 marta yuboriladigan so'rov
    const sent = sessionStorage.getItem(`view_sent_${page}`);
    if (sent) return;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});

    sessionStorage.setItem(`view_sent_${page}`, "1");
  }, [page]);

  return null;
}
