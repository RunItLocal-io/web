import type { Metadata } from "next";
import BuildFinder from "@/components/BuildFinder";
import Page, { PageHead } from "@/components/Page";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Builds",
  description: "Tell us your budget or the model you want. Get the build, the parts list with used prices, and what it can run.",
};

export default function Builds() {
  return (
    <Page>
      <section className="hero" id="builds">
        <PageHead kicker="Builds" title="Find your build">
          Tell us your budget or the model you want, or search the hardware you have, from a Chromebook to a DGX Spark. We&apos;ll show you the build, the parts list with used prices, and what it can actually run.
        </PageHead>
        <BuildFinder />
        <p className="small">Prices are rough US ranges checked in late October 2026, used unless marked new, before tax and shipping. The AI memory shortage has pushed GPUs, RAM and SSDs to two or three times their 2025 prices, and they move week to week. Live eBay prices are coming to the full build pages.</p>
      </section>
    </Page>
  );
}
