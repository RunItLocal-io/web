import type { Metadata } from "next";
import Link from "next/link";
import CopyCommand from "@/components/CopyCommand";
import Page, { PageHead } from "@/components/Page";
import Signup from "@/components/Signup";
import { NEMOTRON_BOLT_GGUF } from "@/lib/builds";
import { STUDIO, tabFor } from "@/lib/studio/links";
import "./podcast.css";

export const metadata: Metadata = {
  title: "Podcast",
  description: "The RunItLocal.io podcast: all things AI, and how to run it yourself. Sign up for new episodes and lab notes.",
};

const TOPICS = ["New open models, tested on real hardware", "Used GPUs and what to buy", "Agents and local tools", "Owning your data", "What broke on the rack this week"];

export default function Podcast() {
  return (
    <Page className="podcast">
      <section className="pod-hero">
        <PageHead kicker="The RunItLocal.io podcast" title="All things AI. Run it local.">
          Conversations about the newest models, the hardware that runs them, and doing it yourself, from the people who run a rack of 90 used GPUs. The first episode is on its way. Sign up and get it the day it drops, plus our lab notes.
        </PageHead>
        <div className="card pod-signup">
          <div className="wave" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <span key={i} style={{ animationDelay: `${(i * 97) % 1100}ms` }} />)}</div>
          <Signup source="podcast" cta="Get the podcast" />
          <p className="small">One email when there&apos;s a new episode or lab note. No spam, unsubscribe anytime.</p>
        </div>
        <ul className="topics">{TOPICS.map(t => <li key={t}>{t}</li>)}</ul>
      </section>

      <section id="notes">
        <div className="head reveal">
          <span className="kicker">From the lab</span>
          <h2>What we tested this week</h2>
          <p>Short write-ups from the rack: what came out, whether it runs on used hardware, and what broke. The longer story is on the show.</p>
        </div>
        <div className="posts">
          <article className="post reveal">
            <time dateTime="2026-10-19">Oct 19, 2026</time>
            <div className="body">
              <span className="tag">Lab note</span>
              <h3>A billion tokens on 90 used GPUs: 2.9 days</h3>
              <p>Qwen3.6-35B-A3B on Tesla P100s, RTX A4500s and ex-mining CMP cards. The 2016 P100s never throttled, and the A4500s won every speed test while sitting on their power cap.</p>
              <div className="runson">
                <div><span>2× P100</span>53 tok/s</div>
                <div><span>2× A4500</span>110 tok/s</div>
                <div><span>Power per 1M tokens</span>6 to 8 cents</div>
              </div>
              <a className="more" href="https://claude.ai/artifact/YHV3B1kMy3h6nRzbKDidFY" rel="noopener">Read the full bench</a>
            </div>
          </article>
          <article className="post reveal">
            <time dateTime="2026-10-15">Oct 15, 2026</time>
            <div className="body">
              <span className="tag queued">Testing now</span>
              <h3>NVIDIA&apos;s Nemotron 3.5 Bolt squeezes a 74B model into 24 GB</h3>
              <p>A 74B mixture-of-experts model with 9B active, trained to run at 2-bit, with vision built in. Open weights, commercial use allowed.</p>
              <div className="runson">
                <div><span>Memory</span>About 24 GB</div>
                <div><span>Cheapest build</span>2× P100 or one 3090</div>
                <div><span>Our test</span>Queued on P100, A4500, CMP</div>
                <div><span>Catch</span>NVIDIA&apos;s own file needs Ada or Blackwell. Use the Unsloth GGUF on older cards.</div>
              </div>
              <a className="more" href={NEMOTRON_BOLT_GGUF} rel="noopener">Model files on Hugging Face</a>
            </div>
          </article>
        </div>
      </section>

      <section id="learn">
        <div className="head reveal">
          <span className="kicker">New to this? Start here</span>
          <h2>Run it local in six steps</h2>
          <p>From your first model on the computer you already own to a server that runs your whole team. Every step has guides in <Link href="/learn">Learn</Link>.</p>
        </div>
        <ol className="path">
          <li className="reveal"><span className="n">01</span><b><Link href="/learn#start">Run your first model</Link></b><div><p>Install Ollama, then run one command. Works on most laptops.</p><CopyCommand cmd="ollama run qwen3:8b" /></div></li>
          <li className="reveal"><span className="n">02</span><b><Link href="/learn#basics">Know what matters</Link></b><p>Memory, quantization, and why one card is fast and another isn&apos;t.</p></li>
          <li className="reveal"><span className="n">03</span><b><Link href="/learn#hardware">Pick your build</Link></b><p>Match a budget to the models you want. Use the <Link href="/builds">build finder</Link>.</p></li>
          <li className="reveal"><span className="n">04</span><b><Link href="/learn#hardware">Build it</Link></b><p>Parts, drivers, cooling, and the cables nobody tells you about.</p></li>
          <li className="reveal"><span className="n">05</span><b><Link href="/learn#serve">Serve it</Link></b><p>Ollama, then llama.cpp, then Open WebUI for a ChatGPT-style app.</p></li>
          <li className="reveal"><span className="n">06</span><b><Link href="/learn#use">Make it useful</Link></b><p>Chat with your documents, run agents, add voice. Or try it now in the <Link href={STUDIO} {...tabFor(STUDIO)}>Studio</Link>.</p></li>
        </ol>
      </section>
    </Page>
  );
}
