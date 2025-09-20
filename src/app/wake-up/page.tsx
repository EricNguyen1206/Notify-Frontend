"use client";
import { useEffect, useState } from "react";

export default function WakingUpPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let delay = 1000;
    let cancelled = false;

    async function loop() {
      while (!cancelled) {
        const res = await fetch("/api/health");
        if (res.ok) {
          setReady(true);
          window.location.reload();
          return;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 30000);
      }
    }

    loop();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>⏳ Waking up backend server...</p>
    </div>
  );
}
