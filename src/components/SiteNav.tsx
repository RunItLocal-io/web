"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabFor } from "@/lib/studio/links";

// Lives in the root layout, so it stays put while page content transitions underneath it.

export const SECTIONS = [
  { href: "/", label: "Home" },
  { href: "/studio", label: "Studio" },
  { href: "/builds", label: "Builds" },
  { href: "/learn", label: "Learn" },
  { href: "/podcast", label: "Podcast" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/people", label: "People" },
];

// Where the community talks. The Discord is Nexus Network's server, not ours; we hang out there.
export const COMMUNITY = [
  { href: "https://www.facebook.com/groups/runitlocal", label: "Facebook group" },
  { href: "https://discord.gg/dBVCSQ4ee", label: "Discord · Nexus Network" },
];

const indexOf = (path: string) => SECTIONS.findIndex(s => s.href === path);

/** Moving right along the nav slides content left, and back the other way. */
export function direction(from: string, to: string): string[] {
  const a = indexOf(from), b = indexOf(to);
  if (to === "/") return ["nav-back"];
  if (a < 0 || b < 0) return ["nav-forward"];
  return [b > a ? "nav-forward" : "nav-back"];
}

export function SiteNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="site-nav">
      <Link className="brand" href="/" transitionTypes={direction(path, "/")}><span className="led" aria-hidden="true" /><span>RunItLocal<span className="tld">.io</span></span></Link>
      <ul>
        {SECTIONS.map(s => (
          <li key={s.href}>
            <Link href={s.href} aria-current={path === s.href ? "page" : undefined} transitionTypes={direction(path, s.href)} {...tabFor(s.href)}>{s.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const path = usePathname();
  return (
    <footer>
      <span className="tagline"><span className="led" aria-hidden="true" />RunItLocal.io · run it yourself, own your data</span>
      <ul>
        {SECTIONS.map(s => <li key={s.href}><Link href={s.href} transitionTypes={direction(path, s.href)} {...tabFor(s.href)}>{s.label}</Link></li>)}
      </ul>
      <ul className="community" aria-label="Community">
        {COMMUNITY.map(c => <li key={c.href}><a href={c.href} target="_blank" rel="noopener noreferrer">{c.label} ↗</a></li>)}
      </ul>
    </footer>
  );
}
