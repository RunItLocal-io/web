import type { Metadata } from "next";
import { Suspense } from "react";
import AddRig from "@/components/AddRig";
import Board from "@/components/Board";
import Page, { PageHead } from "@/components/Page";
import "./leaderboard.css";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Join the RunItLocal.io leaderboard: test your rig on the newest open models and see where it lands against real hardware.",
};

export default function Leaderboard() {
  return (
    <Page>
      <section id="board">
        <PageHead kicker="Join the leaderboard" title="Where does your rig land?">
          Run one prompt on your machine, submit the result, and see how it stacks up against real hardware, not spec sheets. When a new model drops, we add it as a test, so the board shows where local AI really is right now.
        </PageHead>
        <ol className="path join-steps">
          <li><span className="n">01</span><b>Join</b><p>Pick a name and a test below. You get a prompt for your AI agent.</p></li>
          <li><span className="n">02</span><b>Submit your run</b><p>Your agent reads your specs, runs the test, shows you the result, then posts it here.</p></li>
          <li><span className="n">03</span><b>Test the newest</b><p>New model out? Run it again and see where every rig, including yours, lands.</p></li>
        </ol>
        <p><a className="btn" href="#rigs">Join the leaderboard</a></p>
        <Suspense fallback={<div className="card panel"><p className="small">Loading the board…</p></div>}>
          <Board />
        </Suspense>
      </section>
      <section id="rigs" className="add-rig">
        <header className="head">
          <span className="kicker">Already running it local?</span>
          <h2>Join the leaderboard</h2>
          <p className="lede">Pick a test and give us a name. Your agent reads your specs, runs the test, and posts the result here. It leaves out hostnames, paths and serials, and shows you everything before it sends.</p>
        </header>
        <AddRig />
      </section>
    </Page>
  );
}
