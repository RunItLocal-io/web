import type { Metadata } from "next";
import BuildFinder from "@/components/BuildFinder";
import Page, { PageHead } from "@/components/Page";

export const metadata: Metadata = {
  title: "Builds",
  description: "Tell us your budget or the model you want. Get the build, the parts list with used prices, and what it can run.",
};

export default function Builds() {
  return (
    <Page>
      <section className="hero" id="builds">
        <PageHead kicker="Builds" title="Find your build">
          Tell us your budget or the model you want. We&apos;ll show you the build, the parts list with used prices, and what it can actually run.
        </PageHead>
        <BuildFinder />
        <p className="small">Prices are rough used-market ranges as of October 2026, before tax and shipping. Live eBay prices are coming to the full build pages.</p>
      </section>
    </Page>
  );
}
