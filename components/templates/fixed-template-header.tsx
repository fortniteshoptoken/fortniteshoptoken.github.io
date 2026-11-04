"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import type { InternalLink } from "@/config/types";
import { assetPath, routePath } from "@/lib/urls";

export function FixedTemplateHeader({ links }: { links: InternalLink[] }) {
  const pathname = usePathname() || "/";
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const path = pathname.replace(/\/+$/, "") || "/";
  const nav = links.filter((link) => link.slug.replace(/^\/+|\/+$/g, ""));
  const closeMenu = () => setMenuPath(null);

  return (
    <header className="fixed-site-header" onKeyDown={(event) => {
      if (event.key === "Escape") {
        closeMenu();
        event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }}>
      <div className="fixed-site-header-row">
        <Link href="/" className="fixed-site-brand" aria-label={`${siteConfig.game.name || siteConfig.shortName} home`} onClick={closeMenu}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(siteConfig.assets.logo)} alt="" width={40} height={40} />
          <span>{siteConfig.game.name || siteConfig.shortName}</span>
        </Link>
        {nav.length > 0 ? <>
          <button
            type="button"
            className="fixed-site-menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="fixed-site-navigation"
            onClick={() => setMenuPath(open ? null : pathname)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav id="fixed-site-navigation" aria-label="Primary navigation" className={`fixed-site-navigation${open ? " is-open" : ""}`}>
            {nav.map((link) => {
              const target = routePath(link.slug).replace(/\/+$/, "");
              const active = path === target;
              return (
                <Link key={link.slug} href={routePath(link.slug)} aria-current={active ? "page" : undefined} onClick={closeMenu}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </> : null}
      </div>
    </header>
  );
}
