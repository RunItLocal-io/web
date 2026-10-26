import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import Spotlight from "@/components/Spotlight";
import "./globals.css";
import "./sections.css";

const display = Unbounded({
  variable: "--font-display-face",
  subsets: ["latin"],
});

const body = Geist({
  variable: "--font-body-face",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://runitlocal.io"),
  title: { default: "RunItLocal.io", template: "%s · RunItLocal.io" },
  description: "Run AI on your own hardware. Builds, parts lists with used prices, and measured benchmarks from people who run it.",
  // The share card itself is app/opengraph-image.tsx.
  openGraph: { siteName: "RunItLocal.io", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#050608",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="site">
          <SiteNav />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
        <Spotlight />
        {/* Umami, website runitlocal.io (darkcompute-fleet deploy/analytics/sites.yaml) */}
        <Script
          src="https://a.darkcompute.io/assets/app.js"
          data-website-id="5ff26a63-3965-4186-9fdb-1cf7f036e494"
          data-host-url="https://a.darkcompute.io"
          data-domains="runitlocal.io,www.runitlocal.io"
        />
      </body>
    </html>
  );
}
