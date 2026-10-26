import type { Metadata } from "next";
import AddRig from "@/components/AddRig";
import { PageHead, SiteFooter, SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "A leaderboard of real hardware, not spec sheets. Add your rig with one prompt.",
};

export default function Leaderboard() {
  return (
    <div className="wrap">
      <SiteNav />
      <section id="rigs">
        <PageHead kicker="Already running it local?" title="Add your rig to the board">
          Help us build a leaderboard of real hardware, not spec sheets. Paste one prompt into the AI agent on your machine, then paste its result back here. It reads your specs, runs a short test, and leaves out hostnames, paths and serials.
        </PageHead>
        <AddRig />
      </section>
      <SiteFooter />
    </div>
  );
}
