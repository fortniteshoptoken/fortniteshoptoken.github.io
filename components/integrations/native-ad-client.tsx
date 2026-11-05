"use client";

import { useEffect, useRef } from "react";

export function NativeAdClient({ scriptUrl, containerId }: { scriptUrl: string; containerId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Delay injection until after React's effect rehearsal. Exactly one live
    // official container is allowed, including during route transitions.
    const timer = window.setTimeout(() => {
      if (document.getElementById(containerId)) return;
      const container = document.createElement("div");
      container.id = containerId;
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.dataset.cfasync = "false";
      script.dataset.gameWikiNativeAd = containerId;
      host.append(script, container);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      host.replaceChildren();
    };
  }, [containerId, scriptUrl]);

  return <div ref={hostRef} data-native-ad-slot />;
}
