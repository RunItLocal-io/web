import type { Metadata } from "next";
import Page, { PageHead } from "@/components/Page";
import NoTrack from "./NoTrack";

export const metadata: Metadata = {
  title: "Tracking",
  description: "Turn RunItLocal.io analytics off for this browser.",
  robots: { index: false, follow: false },
};

// Opening this page turns Umami off for this browser, for keeping our own visits out of the numbers.
export default function NoTrackPage() {
  return (
    <Page>
      <PageHead kicker="Analytics" title="Your visits, uncounted">
        Opening this page turns off RunItLocal.io analytics in this browser. It&apos;s kept in this browser&apos;s storage, so do it once on each browser and device you use.
      </PageHead>
      <NoTrack />
    </Page>
  );
}
