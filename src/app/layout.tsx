import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
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
  title: { default: "Run It Local", template: "%s · Run It Local" },
  description: "Run AI on your own hardware. Builds, parts lists with used prices, and measured benchmarks from people who run it.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#050608",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
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
