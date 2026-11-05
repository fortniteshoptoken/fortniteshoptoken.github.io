"use client";

import { useEffect } from "react";
import { socialBarUrl } from "@/config/adsterra";

export function SocialBar() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.querySelector('script[data-adsterra-social-bar]')) return;
      const script = document.createElement("script");
      script.dataset.cfasync = "false";
      script.src = socialBarUrl;
      script.dataset.adsterraSocialBar = "";
      document.body.appendChild(script);
    }, 0);
    // The root owns this script for the document lifetime, across SPA navigation.
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
