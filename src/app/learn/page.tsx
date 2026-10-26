import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/Page";
import Signup from "@/components/Signup";
import { TRACKS, article, articles, inTrack } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn to run AI locally: guides from people who run it",
  description: "Plain-English guides to running open AI models on your own hardware: VRAM, quantization, which model to pick, used GPUs, Ollama, llama.cpp, and making it useful.",
  alternates: { canonical: "/learn" },
};

/** The three guides a newcomer should read first, in order. */
const START = ["how-to-run-ai-locally", "how-much-vram-do-you-need", "is-local-ai-worth-it"];

const TOOLS = [
  { href: "/gpu", title: "What can my GPU run?", text: "Every card and Mac, with the models it runs and how fast." },
  { href: "/model", title: "Which model is for what?", text: "Every model we track, what it's good at, and the memory it needs." },
  { href: "/builds", title: "What should I buy?", text: "Builds from $300 with used prices and parts lists." },
];

export default function Learn() {
  const start = START.map(article).filter(a => a !== null);
  const tracks = TRACKS.map(t => ({ ...t, list: inTrack(t.id) })).filter(t => t.list.length);
  return (
    <Page className="docs-page learn-home">
      <header className="docs-head">
        <ol className="docs-crumbs" aria-label="Breadcrumb"><li>Learn</li><li>{articles().length} guides</li></ol>
        <h1>Welcome. Let&apos;s get AI running on <span className="grad">your own hardware.</span></h1>
        <p className="docs-lede">Plain-English guides from the people who run a rack of 90 used GPUs. Start with your first model on the computer you already own, and go as far as a server for your whole team. No account, no cloud, no monthly bill.</p>
      </header>

      <section aria-labelledby="start-h">
        <div className="head"><span className="kicker">New here?</span><h2 id="start-h">Start with these three</h2></div>
        <ol className="start-here">
          {start.map((a, i) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} transitionTypes={["nav-forward"]}>
                <span className="n">0{i + 1}</span><b>{a.title}</b><span>{a.description}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="steps-h">
        <div className="head"><span className="kicker">Browse by step</span><h2 id="steps-h">Everything, from first model to full server</h2></div>
        <div className="track-cards">
          {tracks.map((t, i) => (
            <div key={t.id} className="card track-card">
              <span className="n">Step 0{i + 1}</span>
              <b>{t.label}</b>
              <p>{t.blurb}</p>
              <ul>{t.list.slice(0, 4).map(a => <li key={a.slug}><Link href={`/learn/${a.slug}`}>{a.title}</Link></li>)}</ul>
              {t.list.length > 4 && <a className="more" href="#guides">{t.list.length - 4} more guides</a>}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="tools-h">
        <div className="head"><span className="kicker">Quick answers</span><h2 id="tools-h">Skip the reading</h2></div>
        <ul className="article-list">
          {TOOLS.map(t => <li key={t.href}><Link href={t.href} transitionTypes={["nav-forward"]}><b>{t.title}</b><span>{t.text}</span></Link></li>)}
        </ul>
      </section>

      <section id="subscribe" className="learn-join" aria-labelledby="join-h">
        <div className="card panel">
          <span className="kicker">Mailing list</span>
          <h2 id="join-h">New guides and lab notes, by email</h2>
          <p className="small">One email when there&apos;s a new guide, a podcast episode, or a result from the rack. No spam, unsubscribe anytime.</p>
          <Signup source="learn" cta="Subscribe" />
        </div>
        <Link className="card panel pod-card" href="/podcast" transitionTypes={["nav-forward"]}>
          <span className="kicker">Podcast</span>
          <b>All things AI. Run it local.</b>
          <p className="small">Conversations about new models, the hardware that runs them, and doing it yourself.</p>
          <span className="more">Listen and subscribe</span>
        </Link>
      </section>
    </Page>
  );
}
