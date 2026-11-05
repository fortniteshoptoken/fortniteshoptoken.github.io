"use client";

import { useEffect, useRef } from "react";
import { bannerCodes } from "@/config/adsterra";

export function ResponsiveBanner() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Defer so Strict Mode's rehearsal cannot execute an extra vendor script.
    const timer = window.setTimeout(() => {
      const mobile = !window.matchMedia("(min-width: 768px)").matches;
      const frame = document.createElement("iframe");
      frame.title = "Advertisement";
      frame.width = mobile ? "320" : "728";
      frame.height = mobile ? "50" : "90";
      frame.dataset.bannerSize = mobile ? "320x50" : "728x90";
      // A separate document supports the official document.write-based snippet,
      // without atOptions collisions or blocking the main document's rendering.
      frame.srcdoc = `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body>${mobile ? bannerCodes.mobile : bannerCodes.desktop}</body></html>`;
      host.appendChild(frame);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      host.replaceChildren();
    };
  }, []);

  return (
    <aside className="ad-slot ad-banner" aria-label="Advertisement" data-ad-banner>
      <span className="ad-label">Advertisement</span>
      <div className="ad-banner-host" ref={hostRef} />
    </aside>
  );
}
