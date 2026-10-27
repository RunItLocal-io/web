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
  { href: "/people", label: "People" },
];

// Where the community talks. The Discord is Nexus Network's server, not ours; we hang out there.
export const COMMUNITY = [
  { href: "https://www.facebook.com/groups/runitlocal", label: "Facebook group", icon: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
  { href: "https://discord.gg/T7gqVvYBvq", label: "Nexus Network Discord", icon: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" },
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
        {COMMUNITY.map(c => (
          <li key={c.href}>
            <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.label} title={c.label}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={c.icon} fill="currentColor" /></svg>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
